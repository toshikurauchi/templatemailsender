import React, { useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import slugify from "slugify";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

const FormBase = styled.form`
  display: flex;
  flex-direction: column;
  > .MuiFormControl-root {
    padding-bottom: ${(props) => props.theme.spacing(1) + "px"};
  }
`;

export default function FormCriacao({ label, postUrl, onCriado }) {
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [erro, setErro] = useState(undefined);
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const handleValorChanged = (event) => {
    const novoNome = event.target.value;
    setNome(novoNome);
    setErro("");
    setSlug(slugify(novoNome.toLowerCase()));
  };

  const handleCria = (evento) => {
    evento.preventDefault();
    fetch(postUrl(slug), {
      method: "POST",
      body: JSON.stringify({ nome: nome }),
    })
      .then((res) => {
        if (res.ok) {
          setNome("");
          setSlug("");
          setErro("");
          refreshData();
          return;
        }
        if (res.status === 400) {
          setErro(`O nome ${nome} já está em uso`);
          return;
        }
      })
      .catch(console.error);
  };

  return (
    <FormBase>
      <TextField
        id="new-value"
        value={nome}
        label={erro ? erro : label}
        error={Boolean(erro)}
        onChange={handleValorChanged}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={nome.length === 0 || erro}
        onClick={handleCria}
      >
        Criar
      </Button>
    </FormBase>
  );
}
