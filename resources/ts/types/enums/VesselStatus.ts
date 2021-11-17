enum VesselStatus {
    UsingEngine = 0,
    Anchored = 1,
    NotUnderCommand = 2,
    Restricted = 3,
    ConstrainedByDraught = 4,
    Moored = 5,
    Aground = 6,
    Fishing = 7,
    Sailing = 8,
    ReservedHSC = 9, //Reserved for future amendment of Navigational Status for HSC(high speed craft)(harmful substances)
    ReservedWIG = 10, //Reserved for future amendment of Navigational Status for WIG(wing in ground)(harmful substances)
    TowedAstern = 11,
    TowedAhead = 12,
    ReservedForFutureUse = 13,
    AISSartActive = 14,
    Unknown = 15
};

export default VesselStatus;