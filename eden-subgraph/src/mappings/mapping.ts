import { Mint } from "../../generated/EdenLivemint/EdenLivemint";
import { MintEvent, LivemintToken } from "../../generated/schema";

export function handleMint(event: Mint): void {
  let mintEvent = new MintEvent(event.transaction.hash);
  if (mintEvent) {
    mintEvent.timestamp = event.block.number;
    mintEvent.txHash = event.transaction.hash;
    mintEvent.caller = event.transaction.from;
    mintEvent.tokenId = event.params._tokenId;

    mintEvent.save();

    let livemintToken = new LivemintToken(event.params._tokenId.toHex());
    if (livemintToken) {
      livemintToken.tokenId = event.params._tokenId;
      livemintToken.save();
    }
  }
}
