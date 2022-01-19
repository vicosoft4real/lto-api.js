import { Account } from "./classes/Account";
import { Event } from "./classes/Event";
import { EventChain } from "./classes/EventChain";
import { HTTPSignature } from "./classes/HTTPSignature";
import { Request } from "./classes/Request";
import { IdentityBuilder } from "./classes/IdentityBuilder";
import { Anchor } from "./classes/transactions/anchor";
import { Transfer } from "./classes/transactions/transfer";
import { Association } from "./classes/transactions/association";
import { Lease } from "./classes/transactions/lease";
import { CancelLease } from "./classes/transactions/cancelLease";
import { Sponsorship } from "./classes/transactions/sponsorship";
import { CancelSponsorship } from "./classes/transactions/CancelSponsorship";
import { MassTransfer } from "./classes/transactions/massTransfer";

import config from "./config";
import * as constants from "./constants";

import ed2curve from "./libs/ed2curve";
import crypto from "./utils/crypto";
import logger from "./utils/logger";
import dictionary from "./seedDictionary";
import { IKeyPairBytes } from "../interfaces";


export { Account, Event, EventChain, HTTPSignature, Request, IdentityBuilder };

export class LTO {

	public readonly networkByte: string;
    public keyType: string;


	constructor(networkByte = "L", nodeAddress?: string, keyType = "ed25519") {
		this.networkByte = networkByte;
        this.keyType = keyType;

		if (this.networkByte.charCodeAt(0) == constants.MAINNET_BYTE) 
			config.set(constants.DEFAULT_MAINNET_CONFIG);
		 if (this.networkByte.charCodeAt(0) == constants.TESTNET_BYTE) 
			config.set(constants.DEFAULT_TESTNET_CONFIG);
		

		if (nodeAddress) 
			config.set({ nodeAddress: nodeAddress });
		
	}

	public generateNewSeed(words = 15): string {

		const random = crypto.generateRandomUint32Array(words);
		const wordCount = dictionary.length;
		const phrase = [];

		for (let i = 0; i < words; i++) {
			const wordIndex = random[i] % wordCount;
			phrase.push(dictionary[wordIndex]);
		}

		return phrase.join(" ");
	}

	/**
   * Creates an account based on a random seed
   */
	public createAccount(words = 15) {
		const phrase = this.generateNewSeed(words);

		if (phrase.length < config.getMinimumSeedLength()) 
			throw new Error("Your seed length is less than allowed in config");
		

		return this.createAccountFromExistingPhrase(phrase);
	}

	/**
   * Creates an account based on an existing seed
   */
	public createAccountFromExistingPhrase(phrase: string): Account {

		if (phrase.length < config.getMinimumSeedLength()) 
			throw new Error("Your seed length is less than allowed in config");
		

		const account = new Account(null, this.networkByte, this.keyType);
		account.seed = phrase;
		account.sign = this.createSignKeyPairFromSeed(phrase, account);
		account.encrypt = this.convertSignToEcnryptKeys(account.sign);
		account.address = crypto.buildRawAddress(account.sign.publicKey, this.networkByte);


		return account;
	}

	/**
   * Creates an account based on a private key
   */
	public createAccountFromPrivateKey(privateKey: string): Account {

		const account = new Account(null, this.networkByte);
		account.sign = this.createSignKeyPairFromSecret(privateKey, account);
		account.encrypt = this.convertSignToEcnryptKeys(account.sign);
		account.address = crypto.buildRawAddress(account.sign.publicKey, this.networkByte);

		return account;
	}

	/**
   * Encrypt seed phrase
   */
	public encryptSeedPhrase(seedPhrase: string, password: string, encryptionRounds = 5000): string {

		if (password && password.length < 8) 
			logger.warn("Your password may be too weak");
		

		if (encryptionRounds < 1000) 
			logger.warn("Encryption rounds may be too few");
		

		if (seedPhrase.length < config.getMinimumSeedLength()) 
			throw new Error("The seed phrase you are trying to encrypt is too short");
		

		return crypto.encryptSeed(seedPhrase, password, encryptionRounds);

	}

	/**
   * Decrypt seed phrase
   */
	public decryptSeedPhrase(encryptedSeedPhrase: string, password: string, encryptionRounds = 5000): string {

		const wrongPasswordMessage = "The password is wrong";

		let phrase;

		try {
			phrase = crypto.decryptSeed(encryptedSeedPhrase, password, encryptionRounds);
		} catch (e) {
			throw new Error(wrongPasswordMessage);
		}

		if (phrase === "" || phrase.length < config.getMinimumSeedLength()) 
			throw new Error(wrongPasswordMessage);
		

		return phrase;

	}

	public isValidAddress(address: string): boolean {
		return crypto.isValidAddress(address, this.networkByte.charCodeAt(0));
	}

	/**
   * Create an event chain id based on a public sign key
   *
   * @param publicSignKey {string} - Public sign on which the event chain will be based
   * @param nonce {string} - (optional) A random nonce will generate by default
   */
	public createEventChainId(publicSignKey: string, nonce?: string): string {

		const account = new Account();
		account.setPublicSignKey(publicSignKey);

		return account.createEventChain(nonce).id;
	}

	protected createSignKeyPairFromSecret(privatekey: string, account: Account): IKeyPairBytes {
		return account.accountFactories[this.keyType].buildSignKeyPairFromSecret(privatekey);
	}

	protected createSignKeyPairFromSeed(seed: string, account: Account, nonce: number = 0): IKeyPairBytes {
		const keys = account.accountFactories[this.keyType].buildSignKeyPairFromSeed(seed, nonce);

		return {
			privateKey: keys.privateKey,
			publicKey: keys.publicKey
		};
	}

	public fromData(data) {
		switch (data.type) {
		case 15:
			return new Anchor(data["anchor"]).fromData(data);
		case 4:
			return new Transfer(data["recipient"], data["amount"]).fromData(data);
		case 16:
			return new Association("", "", "").fromData(data);
		case 17:
			return new Association("", "").fromData(data);
		case 8:
			return new Lease("", 1).fromData(data);
		case 9:
			return new CancelLease("").fromData(data);
		case 18:
			return new Sponsorship(data["recipient"]).fromData(data);
		case 19:
			return new CancelSponsorship(data["recipient"]).fromData(data);
		case 11:
			return new MassTransfer("").fromData(data);
		default:
			console.error("Transaction type not recognized");
		}

	}

	protected convertSignToEcnryptKeys(signKeys: IKeyPairBytes): IKeyPairBytes {
		return {
			privateKey: ed2curve.convertSecretKey(signKeys.privateKey),
			publicKey: ed2curve.convertSecretKey(signKeys.publicKey)
		};
	}
}
