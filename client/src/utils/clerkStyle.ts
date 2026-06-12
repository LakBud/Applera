export const clerkAuthAppearance = {
  variables: {
    fontFamily: 'var(--font-sans)',
  },

  elements: {
    card: {
      fontFamily: 'var(--font-sans)',
    },

    headerTitle: {
      color: 'hsl(var(--primary))',
      fontFamily: 'var(--font-sans)',
    },

    headerSubtitle: {
      color: 'var(--text-muted)',
    },

    formFieldLabel: {
      color: 'var(--text-label)',
    },

    formFieldInput: {
      fontFamily: 'var(--font-sans)',
    },

    formButtonPrimary: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
    },

    socialButtonsBlockButton: {
      color: '#000000',
    },

    socialButtonsBlockButtonText: {
      color: '#000000',
      fontWeight: '500',
    },

    footerActionLink: {
      color: 'var(--text-link)',
    },
  },
};

export const clerkUserButtonAppearance = {
  elements: {
    /* ─────────────────────────────
       TRIGGER (avatar button)
    ───────────────────────────── */
    userButtonTrigger: {
      minWidth: '44px',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarBox: {
      width: '2rem',
      height: '2rem',
    },

    /* ─────────────────────────────
       POPUP CARD
    ───────────────────────────── */
    userButtonPopoverCard: {
      backgroundColor: 'var(--surface)',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',

      // mobile-friendly sizing
      width: '260px',
      maxWidth: '92vw',
    },

    userButtonPopoverMain: {
      fontFamily: 'var(--font-sans)',
    },

    /* ─────────────────────────────
       ACTION ITEMS (menu rows)
    ───────────────────────────── */
    userButtonPopoverActionButton: {
      color: 'var(--text-body)',
      fontFamily: 'var(--font-sans)',

      // bigger tap targets for mobile
      padding: '10px 12px',
      borderRadius: '8px',
      minHeight: '40px',
    },

    userButtonPopoverActionButtonText: {
      color: 'var(--text-body)',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.85rem',
    },

    userButtonPopoverActionButtonIcon: {
      color: 'var(--text-muted)',
      width: '16px',
      height: '16px',
    },

    /* ─────────────────────────────
       FOOTER (hidden for cleaner UX)
    ───────────────────────────── */
    userButtonPopoverFooter: {
      display: 'none',
    },

    /* ─────────────────────────────
       USER INFO PREVIEW
    ───────────────────────────── */
    userPreviewMainIdentifier: {
      color: 'var(--text-h2)',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.9rem',
    },

    userPreviewSecondaryIdentifier: {
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.8rem',
    },
  },
};
