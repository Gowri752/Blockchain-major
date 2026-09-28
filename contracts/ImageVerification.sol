// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ImageVerification
 * @dev Smart contract for storing and verifying image ownership on the blockchain
 */
contract ImageVerification {
    
    struct ImageRecord {
        string imageHash;
        address owner;
        uint256 timestamp;
        string fileName;
        bool exists;
    }
    
    // Mapping from image hash to ImageRecord
    mapping(string => ImageRecord) private images;
    
    // Array to store all image hashes
    string[] private imageHashes;
    
    // Mapping to track user's images
    mapping(address => string[]) private userImages;
    
    // Events
    event ImageRegistered(
        string indexed imageHash,
        address indexed owner,
        uint256 timestamp,
        string fileName
    );
    
    event ImageVerified(
        string indexed imageHash,
        address indexed verifier,
        bool isAuthentic,
        uint256 timestamp
    );
    
    /**
     * @dev Register a new image on the blockchain
     * @param _imageHash SHA-256 hash of the image
     * @param _fileName Original file name
     */
    function registerImage(string memory _imageHash, string memory _fileName) public returns (bool) {
        require(bytes(_imageHash).length > 0, "Image hash cannot be empty");
        require(!images[_imageHash].exists, "Image already registered");
        
        images[_imageHash] = ImageRecord({
            imageHash: _imageHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            fileName: _fileName,
            exists: true
        });
        
        imageHashes.push(_imageHash);
        userImages[msg.sender].push(_imageHash);
        
        emit ImageRegistered(_imageHash, msg.sender, block.timestamp, _fileName);
        
        return true;
    }
    
    /**
     * @dev Verify if an image exists and get its details
     * @param _imageHash SHA-256 hash of the image to verify
     */
    function verifyImage(string memory _imageHash) public returns (bool, address, uint256, string memory) {
        ImageRecord memory record = images[_imageHash];
        
        emit ImageVerified(_imageHash, msg.sender, record.exists, block.timestamp);
        
        if (record.exists) {
            return (true, record.owner, record.timestamp, record.fileName);
        } else {
            return (false, address(0), 0, "");
        }
    }
    
    /**
     * @dev Get image details without emitting event
     * @param _imageHash SHA-256 hash of the image
     */
    function getImageDetails(string memory _imageHash) public view returns (
        bool exists,
        address owner,
        uint256 timestamp,
        string memory fileName
    ) {
        ImageRecord memory record = images[_imageHash];
        return (record.exists, record.owner, record.timestamp, record.fileName);
    }
    
    /**
     * @dev Check if an image is registered
     * @param _imageHash SHA-256 hash of the image
     */
    function isImageRegistered(string memory _imageHash) public view returns (bool) {
        return images[_imageHash].exists;
    }
    
    /**
     * @dev Get all images registered by a specific user
     * @param _user Address of the user
     */
    function getUserImages(address _user) public view returns (string[] memory) {
        return userImages[_user];
    }
    
    /**
     * @dev Get total number of registered images
     */
    function getTotalImages() public view returns (uint256) {
        return imageHashes.length;
    }
    
    /**
     * @dev Get image hash by index
     * @param _index Index in the imageHashes array
     */
    function getImageByIndex(uint256 _index) public view returns (string memory) {
        require(_index < imageHashes.length, "Index out of bounds");
        return imageHashes[_index];
    }
}
