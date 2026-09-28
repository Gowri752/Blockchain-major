// Test file for ImageVerification smart contract
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ImageVerification", function () {
  let imageVerification;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const ImageVerification = await ethers.getContractFactory("ImageVerification");
    imageVerification = await ImageVerification.deploy();
    await imageVerification.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(imageVerification.address).to.be.properAddress;
    });
  });

  describe("Image Registration", function () {
    const imageHash = "a".repeat(64); // Sample SHA-256 hash
    const fileName = "test-image.jpg";

    it("Should register an image successfully", async function () {
      await expect(imageVerification.registerImage(imageHash, fileName))
        .to.emit(imageVerification, "ImageRegistered")
        .withArgs(imageHash, owner.address, fileName);
    });

    it("Should not register duplicate image hash", async function () {
      await imageVerification.registerImage(imageHash, fileName);
      
      await expect(
        imageVerification.registerImage(imageHash, fileName)
      ).to.be.revertedWith("Image already registered");
    });

    it("Should not register with empty hash", async function () {
      await expect(
        imageVerification.registerImage("", fileName)
      ).to.be.revertedWith("Image hash cannot be empty");
    });

    it("Should increment total images count", async function () {
      const initialCount = await imageVerification.getTotalImages();
      await imageVerification.registerImage(imageHash, fileName);
      const newCount = await imageVerification.getTotalImages();
      
      expect(newCount).to.equal(initialCount.add(1));
    });
  });

  describe("Image Verification", function () {
    const imageHash = "b".repeat(64);
    const fileName = "verify-test.jpg";

    beforeEach(async function () {
      await imageVerification.registerImage(imageHash, fileName);
    });

    it("Should verify registered image", async function () {
      const details = await imageVerification.getImageDetails(imageHash);
      
      expect(details[0]).to.be.true; // exists
      expect(details[1]).to.equal(owner.address); // owner
      expect(details[3]).to.equal(fileName); // fileName
    });

    it("Should return false for non-existent image", async function () {
      const fakeHash = "c".repeat(64);
      const details = await imageVerification.getImageDetails(fakeHash);
      
      expect(details[0]).to.be.false;
    });

    it("Should check if image is registered", async function () {
      expect(await imageVerification.isImageRegistered(imageHash)).to.be.true;
      
      const fakeHash = "d".repeat(64);
      expect(await imageVerification.isImageRegistered(fakeHash)).to.be.false;
    });
  });

  describe("User Images", function () {
    it("Should track user's registered images", async function () {
      const hash1 = "e".repeat(64);
      const hash2 = "f".repeat(64);
      
      await imageVerification.connect(addr1).registerImage(hash1, "image1.jpg");
      await imageVerification.connect(addr1).registerImage(hash2, "image2.jpg");
      
      const userImages = await imageVerification.getUserImages(addr1.address);
      
      expect(userImages.length).to.equal(2);
      expect(userImages[0]).to.equal(hash1);
      expect(userImages[1]).to.equal(hash2);
    });

    it("Should return empty array for users with no images", async function () {
      const userImages = await imageVerification.getUserImages(addr2.address);
      expect(userImages.length).to.equal(0);
    });
  });

  describe("Total Images", function () {
    it("Should start with zero images", async function () {
      const total = await imageVerification.getTotalImages();
      expect(total).to.equal(0);
    });

    it("Should count multiple registrations correctly", async function () {
      await imageVerification.registerImage("1".repeat(64), "img1.jpg");
      await imageVerification.registerImage("2".repeat(64), "img2.jpg");
      await imageVerification.registerImage("3".repeat(64), "img3.jpg");
      
      const total = await imageVerification.getTotalImages();
      expect(total).to.equal(3);
    });
  });

  describe("Get Image By Index", function () {
    it("Should retrieve image hash by index", async function () {
      const hash1 = "a".repeat(64);
      const hash2 = "b".repeat(64);
      
      await imageVerification.registerImage(hash1, "img1.jpg");
      await imageVerification.registerImage(hash2, "img2.jpg");
      
      expect(await imageVerification.getImageByIndex(0)).to.equal(hash1);
      expect(await imageVerification.getImageByIndex(1)).to.equal(hash2);
    });

    it("Should revert for out of bounds index", async function () {
      await expect(
        imageVerification.getImageByIndex(0)
      ).to.be.revertedWith("Index out of bounds");
    });
  });
});
