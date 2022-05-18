const main = async () => {
  try {
    const ChainBattlesFactory = await hre.ethers.getContractFactory(
      "ChainBattles"
    );
    const chainBattles = await ChainBattlesFactory.deploy();
    await chainBattles.deployed();

    await chainBattles.mint();
    console.log(await chainBattles.getTokenURI(2));
    console.log(`Contract deployed to ${chainBattles.address}`);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
