import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SendIcon from "@material-ui/icons/Send";
import _ from "lodash";
import uris from "../../../src/uris";
import theme from "../../../src/theme";

const BaseGrid = styled(Grid)`
  display: flex;
  min-height: 500px;
`;

const BaseGridColumn = styled(Grid)`
  display: flex;
  flex-grow: 1;
`;

const BasePaperFillHeight = styled(Paper)`
  flex-grow: 1;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: ${(props) => props.theme.spacing(1) + "px"};
`;

const CircularProgressBase = styled(CircularProgress)`
  &.MuiCircularProgress-root {
    color: #ccc;
  }
`;

export default function Template({
  emailAvailable,
  disciplina,
  template,
  alunos,
  enviados,
}) {
  const [md, setMd] = useState("");
  const [preview, setPreview] = useState("");
  const [destinatarioPreview, setDestinatarioPreview] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [assunto, setAssunto] = useState(template.assunto || "");
  const [cc, setCc] = useState(template.cc || "");
  const [selecionados, setSelecionados] = useState(
    _.fromPairs(
      alunos.map((aluno) => [
        `check_aluno___${aluno.username}`,
        enviados.indexOf(aluno.username) < 0,
      ])
    )
  );
  const alunosSelecionados = alunos.filter(
    (aluno) => selecionados[`check_aluno___${aluno.username}`]
  );

  useEffect(() => {
    fetch(uris.templateMarkdown(disciplina.slug, template.slug))
      .then((res) => res.json())
      .then((json) => setMd(json.markdown))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(
      uris.renderMarkdown(disciplina.slug, template.slug, destinatarioPreview)
    )
      .then((res) => res.json())
      .then((json) => setPreview(json.preview))
      .catch(console.error);
  }, [md, destinatarioPreview]);

  const router = useRouter();
  const refreshData = () => {
    router.replace(router.asPath);
  };

  const handleAlunoCheckChanged = (evento) => {
    setSelecionados({
      ...selecionados,
      [evento.target.name]: evento.target.checked,
    });
  };

  const handleDestinatarioPreviewChanged = (evento) => {
    setDestinatarioPreview(evento.target.value);
  };

  const handleMdChanged = (evento) => {
    const novoMd = evento.target.value;

    fetch(uris.templateMarkdown(disciplina.slug, template.slug), {
      method: "POST",
      body: JSON.stringify({ markdown: novoMd }),
    });

    setMd(novoMd);
  };

  const handleEnviar = () => {
    setEnviando(true);
    fetch(uris.enviar(disciplina.slug, template.slug), {
      method: "POST",
      body: JSON.stringify({
        assunto,
        cc,
        destinatarios: alunosSelecionados.map((aluno) => aluno.username),
      }),
    }).then(() => {
      refreshData();
      setEnviando(false);
    });
  };

  return (
    <>
      <Typography variant="h2" component="h1">
        {template.nome}
      </Typography>
      <Box m={theme.spacing(1, 0, 2)}>
        <Typography variant="h4" component="h2">
          Configurações
        </Typography>
        <Box m={theme.spacing(2, 0)}>
          <TextField
            id="assunto"
            label="Assunto"
            margin="normal"
            value={assunto}
            onChange={(evento) => setAssunto(evento.target.value)}
            fullWidth
          />
          <TextField
            id="cc"
            label="Cc"
            margin="normal"
            value={cc}
            onChange={(evento) => setCc(evento.target.value)}
            fullWidth
          />
        </Box>
        <Accordion defaultExpanded={true}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Destinatários</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup row>
              {alunos.map((aluno) => {
                const componentName = `check_aluno___${aluno.username}`;
                return (
                  <FormControlLabel
                    key={componentName}
                    control={
                      <Checkbox
                        checked={selecionados[componentName]}
                        onChange={handleAlunoCheckChanged}
                        name={componentName}
                      />
                    }
                    label={
                      <div>
                        <Typography>
                          {`${aluno.nome} ${aluno.sobrenome} (${aluno.username})`}
                        </Typography>
                        {enviados.indexOf(aluno.username) >= 0 && (
                          <FormHelperText error={true}>
                            E-mail já enviado para este aluno
                          </FormHelperText>
                        )}
                      </div>
                    }
                  />
                );
              })}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Typography variant="h4" component="h2">
        Template
      </Typography>
      <FormControl>
        <InputLabel id="destinatario-preview">Destinatário Preview</InputLabel>
        <Select
          labelId="destinatario-preview"
          id="destinatario-preview-helper"
          value={destinatarioPreview}
          onChange={handleDestinatarioPreviewChanged}
        >
          {alunosSelecionados.map((aluno) => (
            <MenuItem
              key={`select_preview___${aluno.username}`}
              value={aluno.username}
            >
              {`${aluno.nome} ${aluno.sobrenome} (${aluno.username})`}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText error={!Boolean(destinatarioPreview)}>
          {destinatarioPreview &&
            "Destinatário preview (apenas para visualização)"}
          {!destinatarioPreview &&
            "Selecione um destinatário para visualizar o preview"}
        </FormHelperText>
      </FormControl>
      <BaseGrid container spacing={3}>
        <BaseGridColumn item xs={6}>
          <BasePaperFillHeight>
            <TextArea
              value={md}
              onChange={handleMdChanged}
              placeholder="Digite o template aqui (aceita Markdown)..."
            ></TextArea>
          </BasePaperFillHeight>
        </BaseGridColumn>
        <BaseGridColumn item xs={6}>
          <BasePaperFillHeight>
            <Box m={1}>
              <div dangerouslySetInnerHTML={{ __html: preview }} />
            </Box>
          </BasePaperFillHeight>
        </BaseGridColumn>
      </BaseGrid>
      <Box m={theme.spacing(1, 0)}>
        {!emailAvailable && (
          <Typography color="error">
            Crie um arquivo texto <code>~/.credentials/inspermail</code>{" "}
            contendo o seu e-mail Insper na primeira linha e um app password na
            segunda linha. O app password pode ser gerado em:{" "}
            <a href="https://account.activedirectory.windowsazure.com/AppPasswords.aspx">
              https://account.activedirectory.windowsazure.com/AppPasswords.aspx
            </a>
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={!emailAvailable || alunosSelecionados.length === 0}
          onClick={handleEnviar}
          endIcon={enviando ? <CircularProgressBase size={16} /> : <SendIcon />}
        >
          Enviar
        </Button>
      </Box>
    </>
  );
}

export async function getServerSideProps(context) {
  const { disciplina: disciplinaSlug, template: templateSlug } = context.query;

  const [
    emailAvailable,
    disciplina,
    template,
    alunos,
    enviados,
  ] = await Promise.all([
    fetch(uris.checkEmail())
      .then((res) => res.json())
      .then((json) => json.available)
      .catch(console.error),
    fetch(uris.disciplina(disciplinaSlug))
      .then((res) => res.json())
      .catch(console.error),
    fetch(uris.template(disciplinaSlug, templateSlug))
      .then((res) => res.json())
      .catch(console.error),
    fetch(uris.alunos(disciplinaSlug))
      .then((res) => res.json())
      .catch(console.error),
    fetch(uris.enviados(disciplinaSlug, templateSlug))
      .then((res) => res.json())
      .catch(console.error),
  ]);

  return {
    props: {
      emailAvailable,
      disciplina,
      template,
      alunos,
      enviados,
      breadcrumbs: [
        ["Home", "/"],
        [disciplina.nome, `/${disciplina.slug}`],
        ["Templates", `/${disciplina.slug}/template`],
        [template.nome, `/${disciplina.slug}/template/${template.slug}`],
      ],
    }, // will be passed to the page component as props
  };
}
