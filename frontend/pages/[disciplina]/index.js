import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Link from "../../src/Link";
import uris from "../../src/uris";

export default function Disciplina({ disciplina }) {
  return (
    <>
      <Typography variant="h2" component="h1" paddingBottom={true}>
        {disciplina.nome}
      </Typography>
      <List component="nav" aria-label="disciplinas">
        <ListItem button component={Link} href={`/${disciplina.slug}/aluno`}>
          <ListItemText primary="Alunos" />
        </ListItem>
        <ListItem button component={Link} href={`/${disciplina.slug}/template`}>
          <ListItemText primary="Templates" />
        </ListItem>
      </List>
    </>
  );
}

export async function getServerSideProps(context) {
  const { disciplina: slug } = context.query;

  const disciplina = await fetch(uris.disciplina(slug))
    .then((res) => res.json())
    .catch(console.error);

  return {
    props: {
      disciplina,
      breadcrumbs: [
        ["Home", "/"],
        [disciplina.nome, `/${disciplina.slug}`],
      ],
    }, // will be passed to the page component as props
  };
}
