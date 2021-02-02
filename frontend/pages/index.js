import React from "react";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Link from "../src/Link";
import uris from "../src/uris";
import FormCriacao from "../src/components/FormCriacao";

export default function Index({ disciplinas }) {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Disciplinas
      </Typography>
      <List component="nav" aria-label="disciplinas">
        {disciplinas.map((disciplina) => (
          <ListItem
            key={`disciplina___${disciplina.slug}`}
            button
            component={Link}
            href={`/${disciplina.slug}`}
          >
            <ListItemText primary={disciplina.nome} />
          </ListItem>
        ))}
      </List>
      <FormCriacao label="Criar disciplina" postUrl={uris.disciplina} />
    </>
  );
}

export async function getServerSideProps(context) {
  const disciplinas = await fetch(uris.disciplinas()).then((res) => res.json());

  return {
    props: {
      disciplinas,
    }, // will be passed to the page component as props
  };
}
