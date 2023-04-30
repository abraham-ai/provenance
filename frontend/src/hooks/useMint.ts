import { useState, useEffect } from 'react';
import { usePrepareContractWrite, useContractWrite, useAccount } from "wagmi";
import { contracts } from "../const/contracts";
import { getMerkleProof } from "../lib/merkle";

interface ContractError extends Error {
  reason: string;
}

const useMint = () => {
  const { address } = useAccount();
  const merkleProof = getMerkleProof(address || undefined);
  const [writeError, setWriteError] = useState<ContractError | null>(null);
  
  const { config, error } = usePrepareContractWrite({
    address: contracts.LiveMint.address as `0x${string}`,
    abi: contracts.LiveMint.abi,
    functionName: "mint",
    args: [merkleProof],
  });

  useEffect(() => {
    if (error) {
      setWriteError(error as ContractError);
    } else {
      setWriteError(null);
    }
  }, [error]);

  return { ...useContractWrite(config), error: writeError };
};

export default useMint;
