import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import FormCriacao from "../../../src/components/FormCriacao";
import Link from "../../../src/Link";
import uris from "../../../src/uris";

export default function Disciplina({ disciplina, templates }) {
  return (
    <>
      <Typography variant="h2" component="h1" paddingBottom={true}>
        {disciplina.nome}
      </Typography>
      <List component="nav" aria-label="disciplinas">
        {templates.map((template) => (
          <ListItem
            button
            component={Link}
            href={`/${disciplina.slug}/template/${template.slug}`}
          >
            <ListItemText primary={template.nome} />
          </ListItem>
        ))}
      </List>
      <FormCriacao
        label="Criar template"
        postUrl={uris.template.bind(null, disciplina.slug)}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const { disciplina: slug } = context.query;

  const disciplina = await fetch(uris.disciplina(slug))
    .then((res) => res.json())
    .catch(console.error);

  const templates = await fetch(uris.templates(slug))
    .then((res) => res.json())
    .catch(console.error);

  return {
    props: {
      disciplina,
      templates,
      breadcrumbs: [
        ["Home", "/"],
        [disciplina.nome, `/${disciplina.slug}`],
        ["Templates", `/${disciplina.slug}/template`],
      ],
    }, // will be passed to the page component as props
  };
}
