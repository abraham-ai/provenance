import React from "react";
import { useWaitForTransaction } from "wagmi";
import useMint from "../hooks/useMint";

const Balance = () => {
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
