import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
import React, { useEffect } from "react";
import { useWaitForTransaction } from "wagmi";
import useMint from "../hooks/useMint";

const Balance = () => {
  const [balance, setBalance] = React.useState<BigNumber | undefined>(
    undefined
  );
  const { data, write } = useMint();
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const onMintButtonClicked = () => {
    write?.();
  };

  return (
    <>
      <h4>Eden Livemint</h4>
      <button onClick={onMintButtonClicked} disabled={isLoading}>
        Claim Token
      </button>
    </>
  );
};

export default Balance;
