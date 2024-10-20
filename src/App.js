import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import Main from "./Main";
import UserInfo from "./components/UserInfo";

const App = () => (
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
      </Routes>
    </Router>
  </DynamicContextProvider>
);

export default App;
