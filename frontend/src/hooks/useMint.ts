import { usePrepareContractWrite, useContractWrite, useAccount } from "wagmi";
import { contracts } from "../const/contracts";
import { getMerkleProof } from "../lib/merkle";

const useMint = () => {
  const { address } = useAccount();
  const merkleProof = getMerkleProof(address || undefined);
  const { config, error } = usePrepareContractWrite({
    address: contracts.LiveMint.address as `0x${string}`,
    abi: contracts.LiveMint.abi,
    functionName: "mint",
    args: [merkleProof],
  });
  if (error) {
    console.error(error);
  }
  return useContractWrite(config);
};

export default useMint;
