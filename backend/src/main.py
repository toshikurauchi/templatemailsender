from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import json
from typing import Dict, List
import markdown as md
from collections.abc import MutableMapping
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib, ssl

from templatemailsender.settings import DISCIPLINAS_DIR, TEMPLATES_DIR, MATRICULADO, ARQUIVO_DETALHES, ARQUIVO_MARKDOWN, ARQUIVO_ENVIADOS
from templatemailsender.loaders import carrega_alunos_blackboard

class Disciplina(BaseModel):
    nome: str

class Template(BaseModel):
    nome: str

class TemplateMarkdown(BaseModel):
    markdown: str

class DetalhesEmail(BaseModel):
    assunto: str
    cc: str
    destinatarios: List[str]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def carrega_credenciais():
    credentials_path = Path.home() / '.credentials' / 'inspermail'
    if not credentials_path.is_file():
        return None, None
    with open(credentials_path) as f:
        email, password = [l.strip() for l in f.readlines()[:2]]
    return email, password

@app.get('/check-email')
def verifica_disponibilidade_do_email():
    email, password = carrega_credenciais()
    return {"available": email and password}

@app.get("/")
def lista_disciplinas():
    try:
        disciplinas = []
        for d in Path(DISCIPLINAS_DIR).iterdir():
            arquivo_detalhes = d / ARQUIVO_DETALHES
            if not d.is_dir() or not arquivo_detalhes.is_file():
                continue
            with open(arquivo_detalhes) as f:
                disciplina = json.load(f)
            disciplina['slug'] = d.name
            disciplinas.append(disciplina)
        return disciplinas
    except FileNotFoundError:
        return []

@app.post("/{disciplina_slug}")
def cria_disciplina(disciplina_slug: str, disciplina: Disciplina):
    disciplina_dir = Path(DISCIPLINAS_DIR) / disciplina_slug
    if disciplina_dir.exists():
        raise HTTPException(status_code=400, detail="Já existe uma disciplina com esse nome")
    disciplina_dir.mkdir(parents=True)
    with open(disciplina_dir / ARQUIVO_DETALHES, 'w') as f:
        json.dump(disciplina.dict(), f)
    return {disciplina_slug}

@app.get("/{disciplina_slug}")
def pega_disciplina(disciplina_slug: str):
    disciplina_dir = Path(DISCIPLINAS_DIR) / disciplina_slug
    with open(disciplina_dir / ARQUIVO_DETALHES) as f:
        disciplina = json.load(f)
    disciplina['slug'] = disciplina_slug
    return disciplina

def carrega_alunos(disciplina_slug: str):
    disciplina_dir = Path(DISCIPLINAS_DIR) / disciplina_slug
    try:
        with open(disciplina_dir / 'alunos.json') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def carrega_alunos_por_username(disciplina_slug: str):
    alunos = carrega_alunos(disciplina_slug)
    return {aluno['username']: aluno for aluno in alunos}

@app.get("/{disciplina_slug}/aluno")
def lista_alunos(disciplina_slug: str):
    return carrega_alunos(disciplina_slug)

@app.post("/{disciplina_slug}/aluno/upload")
def upload_students(disciplina_slug: str, file: UploadFile = File(...)):
    disciplina_dir = Path(DISCIPLINAS_DIR) / disciplina_slug
    raw_dir = disciplina_dir / 'raw'
    raw_dir.mkdir(parents=True, exist_ok=True)
    novo_arquivo = raw_dir / file.filename
    dados = file.file.read()
    if isinstance(dados, str):
        mode = 'w'
    else:
        mode = 'wb'
    with open(novo_arquivo, mode) as f:
        f.write(dados)
    dados_alunos = carrega_alunos_blackboard(novo_arquivo)
    alunos = [
        {
            'nome': linha['nome'],
            'sobrenome': linha['sobrenome'],
            'username': linha['username'],
            'email': linha['email'],
            MATRICULADO: True,
        }
        for _, linha in dados_alunos.iterrows()
    ]
    with open(disciplina_dir / 'alunos.json', 'w') as f:
        json.dump(alunos, f)
    return alunos

@app.get("/{disciplina_slug}/template")
def lista_templates(disciplina_slug: str):
    templates_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR
    if not templates_dir.is_dir():
        return []
    templates = []
    for d in templates_dir.iterdir():
        try:
            with open(d / ARQUIVO_DETALHES) as f:
                template = json.load(f)
                templates.append(template)
        except FileNotFoundError:
            pass
    return templates

def carrega_detalhes_do_template(disciplina_slug: str, template_slug: str):
    template_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR / template_slug
    with open(template_dir / ARQUIVO_DETALHES) as f:
        template = json.load(f)
    return template

def salva_detalhes_do_template(disciplina_slug: str, template_slug: str, detalhes: Dict):
    template_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR / template_slug
    with open(template_dir / ARQUIVO_DETALHES, 'w') as f:
        json.dump(detalhes, f)

@app.post("/{disciplina_slug}/template/{template_slug}")
def cria_template(disciplina_slug: str, template_slug: str, template: Template):
    template_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR / template_slug
    if template_dir.exists():
        raise HTTPException(status_code=400, detail="Já existe um template com esse nome")
    template_dir.mkdir(parents=True)
    detalhes = template.dict()
    detalhes['slug'] = template_slug
    salva_detalhes_do_template(disciplina_slug, template_slug, detalhes)
    return {template_slug}

@app.get("/{disciplina_slug}/template/{template_slug}")
def pega_template(disciplina_slug: str, template_slug: str):
    return carrega_detalhes_do_template(disciplina_slug, template_slug)

@app.post("/{disciplina_slug}/template/{template_slug}/markdown")
def atualiza_markdown(disciplina_slug: str, template_slug: str, template_markdown: TemplateMarkdown):
    template_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR / template_slug
    template_dir.mkdir(parents=True, exist_ok=True)
    with open(template_dir / ARQUIVO_MARKDOWN, 'w') as f:
        f.write(template_markdown.markdown)
    return {template_slug}

@app.get("/{disciplina_slug}/template/{template_slug}/markdown")
def pega_template_markdown(disciplina_slug: str, template_slug: str):
    template_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR / template_slug
    with open(template_dir / ARQUIVO_MARKDOWN) as f:
        return {'markdown': f.read()}

class FormatDefaultDict(MutableMapping):
    def __init__(self, *args, **kwargs) -> None:
        self._data = dict(*args, **kwargs)

    def __getitem__(self, key):
        try:
            return self._data[key]
        except KeyError:
            return f'{{{key}:key-not-found}}'

    def __setitem__(self, key, value):
        self._data[key] = value

    def __delitem__(self, key):
        del self._data[key]

    def __iter__(self):
        return iter(self._data)

    def __len__(self):
        return len(self._data)

def renderiza(template_dir, destinatario, template=None):
    format_args = FormatDefaultDict()
    if destinatario:
        format_args.update(destinatario)
    if not template:
        with open(template_dir / ARQUIVO_MARKDOWN) as f:
            template = f.read()
    return md.markdown(template.format_map(format_args))

@app.get("/{disciplina_slug}/template/{template_slug}/render")
def renderiza_template(disciplina_slug: str, template_slug: str, destinatario: str = None):
    template_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR / template_slug
    alunos = carrega_alunos_por_username(disciplina_slug)
    return {'preview': renderiza(template_dir, alunos.get(destinatario))}


@app.get("/{disciplina_slug}/template/{template_slug}/enviado")
def pega_enviados(disciplina_slug: str, template_slug: str):
    template_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR / template_slug
    try:
        with open(template_dir / ARQUIVO_ENVIADOS) as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def enviar_email(server, remetente, destinatario, assunto, email_html, cc_email=None):
    print('Enviando para', destinatario)

    msg = MIMEMultipart('alternative')
    msg['Subject'] = assunto
    msg['From'] = remetente
    msg['To'] = destinatario
    if cc_email:
        msg['CC'] = cc_email
    msg.add_header('Content-Type','text/html')

    msg.attach(MIMEText(email_html, 'html'))

    server.send_message(msg)

@app.post("/{disciplina_slug}/template/{template_slug}/enviar")
def enviar_emails(disciplina_slug: str, template_slug: str, detalhes: DetalhesEmail):
    # Atualiza arquivo de detalhes
    arquivo_detalhes = carrega_detalhes_do_template(disciplina_slug, template_slug)
    arquivo_detalhes['cc'] = detalhes.cc
    arquivo_detalhes['assunto'] = detalhes.assunto
    salva_detalhes_do_template(disciplina_slug, template_slug, arquivo_detalhes)

    template_dir = Path(DISCIPLINAS_DIR) / disciplina_slug / TEMPLATES_DIR / template_slug
    try:
        with open(template_dir / ARQUIVO_ENVIADOS) as f:
            enviados = json.load(f)
    except FileNotFoundError:
        enviados = []
    with open(template_dir / ARQUIVO_MARKDOWN) as f:
        template = f.read()

    enviados_set = set(enviados)
    alunos = carrega_alunos_por_username(disciplina_slug)
    remetente, senha = carrega_credenciais()
    print(f'Usando email {remetente}')

    print('Criando contexto...')
    context = ssl.create_default_context()
    print('Contexto ok!')

    print('Conectando...')
    with smtplib.SMTP("smtp.office365.com", 587) as server:
        print('Fazendo login...')
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(remetente, senha)
        print('Login ok!')

        destinatarios_ok = []
        for username in detalhes.destinatarios:
            aluno = alunos.get(username)
            if not aluno:
                print(f'Não consegui enviar email para {username}')
                continue
            email_html = renderiza(template_dir, aluno, template)
            enviar_email(server, remetente, aluno['email'], detalhes.assunto, email_html, detalhes.cc)

            destinatarios_ok.append(username)
            enviados_set.add(username)
            with open(template_dir / ARQUIVO_ENVIADOS, 'w') as f:
                json.dump(list(enviados_set), f)
    return destinatarios_ok
