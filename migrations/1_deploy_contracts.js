const ImageVerification = artifacts.require("ImageVerification");

module.exports = function(deployer) {
  deployer.deploy(ImageVerification);
};
