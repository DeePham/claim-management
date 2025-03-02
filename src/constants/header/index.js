export const HEADER_LINKS = [
  {
    role: "claimer",
    home: [
      {
        key: "1",
        label: "Home",
        to: "/",
      },
    ],
    dropdown: {
      to: "claim/claims",
      label: "My claim",
      menu: [
        {
          key: "1",
          label: "Draft",
          to: "claim/claims?status=draft",
        },
        {
          key: "2",
          label: "Pending Approval",
          to: "claim/claims?status=pending",
        },
        {
          key: "3",
          label: "Approved",
          to: "claim/claims?status=approved",
        },
        {
          key: "4",
          label: "Paid",
          to: "claim/claims?status=paid",
        },
        {
          key: "5",
          label: "Rejected",
          to: "claim/claims?status=rejected",
        },
        {
          key: "6",
          label: "Cancelled",
          to: "claim/claims?status=cancelled",
        },
      ],
    },
  },
  {
    role: "approver",
    home: [
      {
        key: "1",
        label: "Home",
        to: "/",
      },
    ],
    dropdown: {
      to: "approver/claims",
      label: "Claim for approval",
      menu: [
        {
          key: "1",
          label: "Pending",
          to: "approver/claims?status=pending",
        },
        {
          key: "2",
          label: "Approved",
          to: "approver/claims?status=approved",
        },
      ],
    },
  },
  {
    role: "finance",
    home: [
      {
        key: "1",
        label: "Home",
        to: "/",
      },
    ],
    dropdown: {
      to: "finance/claims",
      label: "Claim for finance",
      menu: [
        {
          key: "1",
          label: "Approved",
          to: "finance/claims?status=approved",
        },
        {
          key: "2",
          label: "Paid",
          to: "finance/claims?status=paid",
        },
      ],
    },
  },
  {
    role: "administrator",
    home: [
      {
        key: "1",
        label: "Home",
        to: "/",
      },
    ],
    dropdown: {
      to: "manage/claims",
      label: "Configuration",
      menu: [
        {
          key: "1",
          label: "Staff Information",
          to: "manage/staffs",
        },
        {
          key: "2",
          label: "Project Information",
          to: "manage/projects",
        },
      ],
    },
  },
];

export const HEADER_TEXTS = {
  createClaimTitle: "Create Claim",
  createClaimDescription: "Click Create claim when you're done",
  createClaimButton: "Create Claim",
  saveDraftButton: "Save draft",
  myAccount: "My Account",
  profile: "Profile",
  settings: "Settings",
  logout: "Logout",
};
