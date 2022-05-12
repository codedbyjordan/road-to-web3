const { expect } = require("chai");
const { hre } = require("hardhat");

async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return parseFloat(hre.ethers.utils.formatEther(balanceBigInt));
}

describe("BuyMeACoffee", function () {
  it("Should buy a coffee with a message, then withdraw funds to owner wallet", async function () {
    const [owner, tipper] = await hre.ethers.getSigners();

    const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
    const buyMeACoffee = await BuyMeACoffee.deploy();

    await buyMeACoffee.deployed();

    const originalTipperBalance = await getBalance(tipper.address);
    const originalOwnerBalance = await getBalance(owner.address);
    const originalMemoLength = (await buyMeACoffee.getMemos()).length;

    const tip = { value: hre.ethers.utils.parseEther("1") };

    // connect to this address, every function call will be run from the specified address
    await buyMeACoffee.connect(tipper).buyCoffee("Carolina", "Hi Jordan!", tip);

    await buyMeACoffee.withdrawTips();

    const newTipperBalance = await getBalance(tipper.address);
    const newMemoLength = (await buyMeACoffee.getMemos()).length;
    const newOwnerBalance = await getBalance(owner.address);

    expect(
      newTipperBalance < originalTipperBalance,
      "Tipper balance to have decreased"
    ).to.equal(true);

    expect(
      newMemoLength > originalMemoLength,
      "Amount of memos to have increased"
    ).to.equal(true);

    expect(
      newOwnerBalance > originalOwnerBalance,
      "Owner wallet to have gained funds"
    ).to.equal(true);
  });
});
