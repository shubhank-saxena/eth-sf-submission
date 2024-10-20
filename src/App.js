import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Main from "./Main";
import UserInfo from "./components/UserInfo";
import YouTubeOAuth from "./components/youtubeoauth";

const App = () => (
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: "f035d446-74a5-48b6-b705-1616a7dffab1",
        walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/profile" element={<UserInfo />} />
          <Route path="/youtube-oauth" element={<YouTubeOAuth />} />
        </Routes>
      </Router>
    </DynamicContextProvider>
  </GoogleOAuthProvider>
);

export default App;
