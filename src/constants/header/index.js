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
      to: "claim/view-claim",
      label: "My claim",
      menu: [
        {
          key: "1",
          label: "Draft",
          to: "claim/view-claim?status=draft",
        },
        {
          key: "2",
          label: "Pending Approval",
          to: "claim/view-claim?status=pending",
        },
        {
          key: "3",
          label: "Approved",
          to: "claim/view-claim?status=approved",
        },
        {
          key: "4",
          label: "Paid",
          to: "claim/view-claim?status=paid",
        },
        {
          key: "5",
          label: "Rejected",
          to: "claim/view-claim?status=rejected",
        },
        {
          key: "6",
          label: "Cancelled",
          to: "claim/view-claim?status=cancelled",
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
      to: "approver/view-claim",
      label: "Claim for approval",
      menu: [
        {
          key: "1",
          label: "For My Vetting",
          to: "approver/view-claim?status=pending",
        },
        {
          key: "2",
          label: "Approved",
          to: "approver/view-claim?status=approved",
        },
        {
          key: "3",
          label: "Paid",
          to: "approver/view-claim?status=paid",
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
      to: "finance/view-claim",
      label: "Claim for finance",
      menu: [
        {
          key: "1",
          label: "Approved",
          to: "finance/view-claim?status=approved",
        },
        {
          key: "2",
          label: "Paid",
          to: "finance/view-claim?status=paid",
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
      label: "Configuration",
      menu: [
        {
          key: "1",
          label: "Staff Information",
          to: "#",
        },
        {
          key: "2",
          label: "Project Information",
          to: "manage/project",
        },
      ],
    },
  },
];
