// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract PrescriptionRecords {
    struct Prescription {
        string ipfsCid;              // IPFS hash of prescription metadata
        address doctorWallet;        // Doctor's wallet address
        address patientWallet;       // Patient's wallet address
        uint256 timestamp;           // Creation timestamp
        bool isActive;               // Status of prescription
        string prescriptionType;     // Type identifier (e.g., "MEDICAL_PRESCRIPTION")
    }

    // Mapping from unique prescription ID to prescription data
    mapping(bytes32 => Prescription) public prescriptions;
    
    // Mapping to track prescriptions by doctor
    mapping(address => bytes32[]) public doctorPrescriptions;
    
    // Mapping to track prescriptions by patient
    mapping(address => bytes32[]) public patientPrescriptions;
    
    // Counter for generating sequential IDs
    uint256 private prescriptionCounter;

    // Events
    event PrescriptionCreated(
        bytes32 indexed prescriptionId,
        address indexed doctorWallet,
        address indexed patientWallet,
        string ipfsCid,
        uint256 timestamp
    );
    
    event PrescriptionUpdated(
        bytes32 indexed prescriptionId,
        address indexed doctorWallet,
        string newIpfsCid,
        uint256 timestamp
    );

    /**
     * @dev Creates a new prescription record on blockchain
     * @param ipfsCid IPFS hash of the prescription metadata JSON
     * @param doctorWallet Doctor's wallet address
     * @param patientWallet Patient's wallet address
     * @return prescriptionId Unique prescription ID generated
     */
    function createPrescription(
        string calldata ipfsCid,
        address doctorWallet,
        address patientWallet
    ) external returns (bytes32) {
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(doctorWallet != address(0), "Invalid doctor wallet address");
        require(patientWallet != address(0), "Invalid patient wallet address");
        require(msg.sender == doctorWallet, "Only doctor can create prescription");

        // Generate unique prescription ID using multiple entropy sources
        prescriptionCounter++;
        bytes32 prescriptionId = keccak256(
            abi.encodePacked(
                "PRESCRIPTION_",
                doctorWallet,
                patientWallet,
                block.timestamp,
                prescriptionCounter,
                block.difficulty,
                ipfsCid
            )
        );

        // Ensure ID is unique (extremely unlikely to collide, but safety first)
        require(!prescriptions[prescriptionId].isActive, "Prescription ID collision");

        // Create prescription record
        prescriptions[prescriptionId] = Prescription({
            ipfsCid: ipfsCid,
            doctorWallet: doctorWallet,
            patientWallet: patientWallet,
            timestamp: block.timestamp,
            isActive: true,
            prescriptionType: "MEDICAL_PRESCRIPTION"
        });

        // Add to doctor's prescription list
        doctorPrescriptions[doctorWallet].push(prescriptionId);
        
        // Add to patient's prescription list
        patientPrescriptions[patientWallet].push(prescriptionId);

        emit PrescriptionCreated(
            prescriptionId,
            doctorWallet,
            patientWallet,
            ipfsCid,
            block.timestamp
        );

        return prescriptionId;
    }

    /**
     * @dev Updates an existing prescription's IPFS CID
     * @param prescriptionId Unique prescription ID
     * @param newIpfsCid New IPFS hash
     */
    function updatePrescription(
        bytes32 prescriptionId,
        string calldata newIpfsCid
    ) external {
        Prescription storage prescription = prescriptions[prescriptionId];
        require(prescription.isActive, "Prescription does not exist");
        require(msg.sender == prescription.doctorWallet, "Only original doctor can update");
        require(bytes(newIpfsCid).length > 0, "IPFS CID cannot be empty");

        prescription.ipfsCid = newIpfsCid;
        prescription.timestamp = block.timestamp;

        emit PrescriptionUpdated(prescriptionId, prescription.doctorWallet, newIpfsCid, block.timestamp);
    }

    /**
     * @dev Retrieves prescription details by ID
     * @param prescriptionId Unique prescription ID
     * @return ipfsCid IPFS hash of prescription data
     * @return doctorWallet Doctor's wallet address
     * @return patientWallet Patient's wallet address
     * @return timestamp Creation/update timestamp
     * @return isActive Status of prescription
     */
    function getPrescription(bytes32 prescriptionId) 
        external 
        view 
        returns (
            string memory ipfsCid,
            address doctorWallet,
            address patientWallet,
            uint256 timestamp,
            bool isActive
        ) 
    {
        Prescription memory prescription = prescriptions[prescriptionId];
        return (
            prescription.ipfsCid,
            prescription.doctorWallet,
            prescription.patientWallet,
            prescription.timestamp,
            prescription.isActive
        );
    }

    /**
     * @dev Gets all prescription IDs for a specific doctor
     * @param doctorWallet Doctor's wallet address
     * @return Array of prescription IDs
     */
    function getDoctorPrescriptions(address doctorWallet) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return doctorPrescriptions[doctorWallet];
    }

    /**
     * @dev Gets all prescription IDs for a specific patient
     * @param patientWallet Patient's wallet address
     * @return Array of prescription IDs
     */
    function getPatientPrescriptions(address patientWallet) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return patientPrescriptions[patientWallet];
    }

    /**
     * @dev Gets total number of prescriptions created
     * @return Total prescription count
     */
    function getTotalPrescriptions() external view returns (uint256) {
        return prescriptionCounter;
    }

    /**
     * @dev Verifies if a prescription exists and is active
     * @param prescriptionId Unique prescription ID
     * @return True if prescription exists and is active
     */
    function isPrescriptionValid(bytes32 prescriptionId) external view returns (bool) {
        return prescriptions[prescriptionId].isActive;
    }
}
