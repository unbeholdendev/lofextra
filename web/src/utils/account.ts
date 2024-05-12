import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import {
  generateMnemonic,
  mnemonicToEntropy,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english";

export const generateNewAccountKeyPair = () =>
  getKeyPair(generateMnemonic(english));

export const getAccountKeyPairFromMnemonic = (mnemonic: string) => {
  if (!validateMnemonic(mnemonic, english)) {
    alert("invalid mnemonic");

    return undefined;
  }

  return getKeyPair(mnemonic);
};

const getKeyPair = (mnemonic: string) => {
  const privKey = mnemonicToEntropy(mnemonic, english);

  const privKeySha256 = sha256(privKey);

  const pubKey = schnorr.getPublicKey(privKeySha256);

  return { privKey, pubKey };
};

export const getPubKeyHex = (pubKey: string) =>
  bytesToHex(new Uint8Array(pubKey.split(",").map(Number)));
