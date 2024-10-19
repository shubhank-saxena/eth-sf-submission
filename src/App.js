import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import Main from "./Main";


const App = () => (
  <DynamicContextProvider
    theme="auto"
    settings={{
      environmentId: "f035d446-74a5-48b6-b705-1616a7dffab1",
      walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
    }}
  >
    <Main />
  </DynamicContextProvider>
);

export default App;
