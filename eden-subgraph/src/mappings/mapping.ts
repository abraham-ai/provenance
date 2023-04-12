import {
  EdenLivemint,
  Mint,
  MetadataUpdate,
} from "../../generated/EdenLivemint/EdenLivemint";
import {
  MintEvent,
  MetadataUpdateEvent,
  LivemintToken,
} from "../../generated/schema";

export function handleMint(event: Mint): void {
  const edenLivemint = EdenLivemint.bind(event.address);
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
      livemintToken.tokenURI = edenLivemint.tokenURI(event.params._tokenId);
      livemintToken.save();
    }
  }
}

export function handleMetadataUpdate(event: MetadataUpdate): void {
  const edenLivemint = EdenLivemint.bind(event.address);
  let metadataUpdateEvent = new MetadataUpdateEvent(event.transaction.hash);
  if (metadataUpdateEvent) {
    metadataUpdateEvent.timestamp = event.block.number;
    metadataUpdateEvent.txHash = event.transaction.hash;
    metadataUpdateEvent.caller = event.transaction.from;
    metadataUpdateEvent.tokenId = event.params._tokenId;

    metadataUpdateEvent.save();

    let livemintToken = LivemintToken.load(event.params._tokenId.toHex());
    if (livemintToken) {
      livemintToken.tokenURI = edenLivemint.tokenURI(event.params._tokenId);
      livemintToken.save();
    }
  }
}
