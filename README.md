# Enviador de templates de e-mails

![](exemplo.gif)

## Instalando requisitos

Esta aplicação é composta por dois serviços. Para instalar os requisitos do backend:

    $ cd backend
    $ python -m venv env
    $ . env/bin/activate
    $ pip install -r requirements.txt

Para instalar os requisitos do frontend:

    $ cd frontend
    $ npm install

Você também precisa criar um arquivo com as suas credenciais. Crie o arquivo texto `~/.credentials/inspermail` contendo o seu e-mail Insper na primeira linha e um app password na segunda linha. O app password pode ser gerado em: [https://account.activedirectory.windowsazure.com/AppPasswords.aspx](https://account.activedirectory.windowsazure.com/AppPasswords.aspx)

## Executando a aplicação

Na raíz do projeto, execute:

    $ ./run.sh

## Rodando os testes

Por enquanto só o backend possui alguns testes :(

Entre na pasta `backend` e instale com `pip install --editable .` então execute os testes com `python -m pytest`.

## Referências

- https://medium.com/javascript-in-plain-english/ssr-with-next-js-styled-components-and-material-ui-b1e88ac11dfa
