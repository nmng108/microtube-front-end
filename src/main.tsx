import { StrictMode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import App from './App';
import reduxStore from './redux-store.ts';
import './index.css';

const rootElement: HTMLElement = document.getElementById('root')!;
const root: Root = createRoot(rootElement);

const theme = createTheme({
  components: {
    MuiPopover: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiPopper: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiDialog: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiModal: {
      defaultProps: {
        container: rootElement,
      },
    },
  },
});

root.render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Provider store={reduxStore}>
          {/*<WalletProvider>*/}
          {/*  <GlobalContextProvider>*/}
          {/*    <AuthContextProvider>*/}
          {/*      <PeerContextProvider>*/}
          <CssBaseline />
          <App />
          {/*      </PeerContextProvider>*/}
          {/*    </AuthContextProvider>*/}
          {/*  </GlobalContextProvider>*/}
          {/*</WalletProvider>*/}
        </Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
