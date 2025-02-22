import { assert } from "chai";
import { Anchor } from "../../src/transactions";
import base58 from "../../src/libs/base58";
import { AccountFactoryED25519 } from "../../src/accounts";
import Binary from "../../src/Binary";


describe("Anchor", () => {
	const account = new AccountFactoryED25519("T").createFromSeed("test");
	const sponsor = new AccountFactoryED25519("T").createFromSeed("test sponsor");
	const hash = Binary.fromHex("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
	let transaction: Anchor;

	beforeEach(() => {
		transaction = new Anchor(hash);
	});

	describe("#toBinary", () => {
		it("should return a binary tx V3", () => {
			transaction.signWith(account);
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.version = 3;

			assert.equal(base58.encode(transaction.toBinary()),
				"81J6diQthLjberPHzN29R18kwViAdLqdDom3Vaso9MhEAt6uH3CM9sz9NMYjR21PFCJEbojd4jhG1izqz1QM5C1ea9ZpqN5RrY3hrrvVkRBeGDtxyEJEcKMW");
		});

		it("should return a binary tx V2", () => {
			transaction.signWith(account);
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.version = 1;

			assert.equal(base58.encode(transaction.toBinary()),
				"MquGbi8ADEhTeqTgfXUdud2D1oKPTYrGRXaJ4BcmirU3V3LEQPfzckNyjHaHiNKyDyVhUZQ1LnnkbLgpdQZhkpyHGApnfD92bh9bXrSQdFXTuKBvPpGZD");
		});
	});

	describe("#ToJson", () => {
		it("should return a transaction to Json", () => {
			const expected =  JSON.stringify({
				type: 15,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				fee: 35000000,
				timestamp: 1519862400000,
				anchors: [
					"GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn"
				],
				proofs: [
					"5L1N7h7jxSeG7gATTqRibDwHvuHBW57uy78WDxHivybEhdVXKN5F7tBSbytgWqTwXbqWEMaD2J3qmTFALyDAwyrJ"
				]
			});
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#isSigned", () => {
		it("should return false", () => {
			assert.isFalse(transaction.isSigned());
			transaction.signWith(account);
			assert.isTrue(transaction.isSigned());
		});
	});

	describe("#ToJson Sponsor", () => {
		it("should return a transaction to Json with the sponsor data", () => {
			const expected = JSON.stringify({
				type: 15,
				version: 3,
				sender: "3N4mZ1qTrjWKnzBwAxscf7kfkoCs2HGQhJG",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				sponsor: "3MqcESZ7AwBfuxVBroU7Ntp6gDX2TVwUEyy",
				sponsorKeyType: "ed25519",
				sponsorPublicKey: "FpvqV1Ae6wiUwmdjaRZcSuYujKk29qrtBTqtSbmGrtdC",
				fee: 35000000,
				timestamp: 1519862400000,
				anchors: [
					"GKot5hBsd81kMupNCXHaqbhv3huEbxAFMLnpcX2hniwn"
				],
				proofs: [
					"5L1N7h7jxSeG7gATTqRibDwHvuHBW57uy78WDxHivybEhdVXKN5F7tBSbytgWqTwXbqWEMaD2J3qmTFALyDAwyrJ",
					"5992qrUQehcLbJQgWsGPCggZbYWghp6souCzVUhQykk1VxwkrSWTs2Anx7XiTki812R1r96nM8Pehn5NUdRcz5T3"
				]
			});
			transaction.timestamp = new Date('2018-03-01T00:00:00+00:00').getTime();
			transaction.signWith(account);
			transaction.sponsorWith(sponsor);
			assert.equal(JSON.stringify(transaction), expected);
		});
	});

	describe("#from", () => {
		it("should return a transaction from the data", () => {
			const data = {
				type: 15,
				version: 3,
				sender: "3MtHYnCkd3oFZr21yb2vEdngcSGXvuNNCq2",
				senderKeyType: "ed25519",
				senderPublicKey: "2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ",
				sponsor: "3NACnKFVN2DeFYjspHKfa2kvDqnPkhjGCD2",
				sponsorKeyType: "ed25519",
				sponsorPublicKey: "DriAcwPisEqtNcug2JJ2SSSDLgcrEecvmmgZgo9VZBog",
				fee: 35000000,
				timestamp: 1519862400000,
				anchors: [
					"328395t2pcwD3AjkYf8QzAmbyuwCR2ypLNmDVPNTHFX6"
				],
				proofs: [
					"33m6CrpiW5qqmPSdGeaoqQY2EsYz6Bv7iJ1Dx7YtpFuptxMYZWXnW6SQKedFsod78svj6x1Zv9BKwfQndRbozAjt",
					"3Ht3SN8yjWsBH532vFrTexMV7xNAwxEK38JUFwtKtHgFwG4qicuCvT8ZMF41TvoRm1AftzYm7jN3Gy6GHPE78RGk"
				]
			};
			const actual = Anchor.from(data);
			assert.equal(JSON.stringify(actual), JSON.stringify(data));
		});
	});
});
