import { Anchor } from './classes/transactions/anchor'
import { LTO } from './LTO';
import { PublicNode } from './classes/publicNode';
import { getPositionOfLineAndCharacter, moveSyntheticComments } from 'typescript';
import { type } from 'os';
import { typeOf } from 'ts-utils';
import { __awaiter } from 'tslib';
import base58 from './libs/base58';
import { Transfer } from './classes/transactions/transfer';
import crypto from "./utils/crypto";
import convert from './utils/convert';
import { data } from '@lto-network/lto-transactions';
import { Association } from './classes/transactions/association';


const phrase = 'cool strike recall mother true topic road bright nature dilemma glide shift return mesh strategy';
const phrase2 = 'cage afford gym kitchen price physical grid impulse tumble uncover deliver bounce dance display vintage';
let account = new LTO('T').createAccountFromExistingPhrase(phrase);
let third = new LTO('T').createAccountFromExistingPhrase(phrase2);

let node = new PublicNode('https://testnet.lto.network');

//let transaction = new Transfer(third.address, 100000000);
let transaction = new Association(third.address, 2, 'rlgeorgljergljerlkgej', 1640195109486);
transaction.timestamp = 1640165108486
transaction.signWith(account);
console.log(transaction.proofs)
//transaction.sponsorWith(account);
async function my(){
    let ret = await transaction.broadcastTo(node);
    console.log(ret)
}
my();




/*console.log(base58.encode(Uint8Array.from([transaction.type])))
console.log(base58.encode(Uint8Array.from([transaction.version])))
console.log(base58.encode(Uint8Array.from(crypto.strToBytes(transaction.chainId))))
console.log(base58.encode(Uint8Array.from(convert.longToByteArray(transaction.timestamp))))
console.log(base58.encode(Uint8Array.from([1])))
console.log(base58.encode(base58.decode(transaction.senderPublicKey)))
console.log(base58.encode(Uint8Array.from(convert.longToByteArray(transaction.txFee))))
console.log(base58.encode(base58.decode(transaction.recipient)))
console.log(base58.encode(Uint8Array.from(convert.integerToByteArray(transaction.associationType))))
console.log(base58.encode(Uint8Array.from(convert.longToByteArray(transaction.expires))))
console.log(base58.encode(Uint8Array.from(convert.shortToByteArray(transaction.anchor.length))))
console.log(base58.encode(Uint8Array.from(convert.stringToByteArray(transaction.anchor))))*/


