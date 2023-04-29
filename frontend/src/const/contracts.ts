import EdenLivemintContract from "eden-livemint/out/EdenLivemint.sol/EdenLivemint.json";
import Broadcast from "eden-livemint/broadcast/Deploy.s.sol/1337/run-latest.json";

const getContractAddress = (contractName: string) => {
  const contract = Broadcast.transactions.find(
    (contract) => contract.contractName === contractName
  );
  if (!contract) {
    throw new Error(`Contract ${contractName} not found`);
  }
  return contract.contractAddress;
};

export const contracts = {
  LiveMint: {
    address: getContractAddress("EdenLivemint"),
    abi: EdenLivemintContract.abi,
  },
};
