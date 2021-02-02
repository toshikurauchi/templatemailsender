import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import styled, { ThemeProvider } from "styled-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import theme from "../src/theme";
import Link from "../src/Link";

const Title = styled(Typography)`
  flex-grow: 1;
`;

const HeaderLink = styled(Link)`
  &.MuiTypography-colorPrimary {
    color: white;
  }
`;

export default function MyApp(props) {
  const { Component, pageProps } = props;
  const breadcrumbs = pageProps.breadcrumbs || [["Home", "/"]];

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Template Email Sender</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <Title variant="h6">
                <Breadcrumbs aria-label="breadcrumb">
                  {breadcrumbs.map(([nome, link], index) =>
                    index < breadcrumbs.length - 1 ? (
                      <HeaderLink key={`breadcrumb___${nome}`} href={link}>
                        {nome}
                      </HeaderLink>
                    ) : (
                      <Typography key={`breadcrumb___${nome}`}>
                        {nome}
                      </Typography>
                    )
                  )}
                </Breadcrumbs>
              </Title>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md">
            <Box my={4}>
              <Component {...pageProps} />
            </Box>
          </Container>
        </ThemeProvider>
      </MuiThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
