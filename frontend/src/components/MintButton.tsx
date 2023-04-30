import React from "react";
import { useWaitForTransaction } from "wagmi";
import useMint from "../hooks/useMint";

const Balance = () => {
  const { data, write, error } = useMint();
  
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const onMintButtonClicked = () => {
    write?.();
  };

  return (
    <>
      <h4>Eden Livemint</h4>
      {error ? (
        <p>Cannot mint: {error.reason}</p>
      ) : (
        <button onClick={onMintButtonClicked} disabled={isLoading}>
          Claim Token
        </button>
      )}
    </>
  );
};

export default Balance;
