import { ConnectButton } from "@rainbow-me/rainbowkit";
import Balance from "../components/MintButton";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <ConnectButton />
      <Balance />
    </div>
  );
}
