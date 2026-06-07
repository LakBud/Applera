export const clerkAuthAppearance = {
  variables: {
    fontFamily: "var(--font-sans)",
  },

  elements: {
    card: {
      fontFamily: "var(--font-sans)",
    },

    headerTitle: {
      color: "hsl(var(--primary))",
      fontFamily: "var(--font-sans)",
    },

    headerSubtitle: {
      color: "var(--text-muted)",
    },

    formFieldLabel: {
      color: "var(--text-label)",
    },

    formFieldInput: {
      fontFamily: "var(--font-sans)",
    },

    formButtonPrimary: {
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
    },

    socialButtonsBlockButton: {
      color: "#000000",
    },

    socialButtonsBlockButtonText: {
      color: "#000000",
      fontWeight: "500",
    },

    footerActionLink: {
      color: "var(--text-link)",
    },
  },
};

export const clerkUserButtonAppearance = {
  elements: {
    avatarBox: {
      width: "2rem",
      height: "2rem",
    },

    userButtonPopoverCard: {
      backgroundColor: "var(--surface)",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow-md)",
    },

    userButtonPopoverMain: {
      fontFamily: "var(--font-sans)",
    },

    userButtonPopoverFooter: {
      display: "none",
    },

    userButtonPopoverActionButton: {
      color: "var(--text-body)",
      fontFamily: "var(--font-sans)",
    },

    userButtonPopoverActionButtonText: {
      color: "var(--text-body)",
      fontFamily: "var(--font-sans)",
    },

    userButtonPopoverActionButtonIcon: {
      color: "var(--text-muted)",
    },

    userPreviewMainIdentifier: {
      color: "var(--text-h2)",
      fontFamily: "var(--font-sans)",
    },

    userPreviewSecondaryIdentifier: {
      color: "var(--text-muted)",
      fontFamily: "var(--font-sans)",
    },
  },
};
