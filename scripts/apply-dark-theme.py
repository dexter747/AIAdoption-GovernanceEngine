#!/usr/bin/env python3
"""
Apply ShadCN black theme across all frontend files.
- Remove dark: prefixed classes (keep the dark variant value)
- Remove corresponding light-mode classes when dark: variant exists
- Convert remaining light-mode colors to dark equivalents
"""
import re
import os
import sys

# Files to process (excluding node_modules and already-updated files)
BASE = "/Users/developer/Desktop/AI Adoption & Governance Engine"

FILES = [
    # Admin Dashboard
    "apps/admin-dashboard/src/app/dashboard/analytics/page.tsx",
    "apps/admin-dashboard/src/app/dashboard/downloads/page.tsx",
    "apps/admin-dashboard/src/app/dashboard/layout.tsx",
    "apps/admin-dashboard/src/app/dashboard/licenses/page.tsx",
    "apps/admin-dashboard/src/app/dashboard/page.tsx",
    "apps/admin-dashboard/src/app/dashboard/payments/page.tsx",
    "apps/admin-dashboard/src/app/dashboard/settings/page.tsx",
    "apps/admin-dashboard/src/app/dashboard/users/page.tsx",
    "apps/admin-dashboard/src/app/page.tsx",
    "apps/admin-dashboard/src/app/login/page.tsx",
    "apps/admin-dashboard/src/components/Sidebar.tsx",
    # Desktop App
    "apps/desktop-app/src/renderer/components/ContextManager.tsx",
    "apps/desktop-app/src/renderer/components/Sidebar.tsx",
    "apps/desktop-app/src/renderer/components/ui/error-boundary.tsx",
    "apps/desktop-app/src/renderer/components/ui/loading.tsx",
    "apps/desktop-app/src/renderer/components/ui/toast.tsx",
    "apps/desktop-app/src/renderer/pages/APIKeysPage.tsx",
    "apps/desktop-app/src/renderer/pages/ConnectionsDashboard.tsx",
    "apps/desktop-app/src/renderer/pages/ConnectionsPage.tsx",
    "apps/desktop-app/src/renderer/pages/ConnectionsPageEnhanced.tsx",
    "apps/desktop-app/src/renderer/pages/DashboardPage.tsx",
    "apps/desktop-app/src/renderer/pages/LibraryPage.tsx",
    "apps/desktop-app/src/renderer/pages/LicenseActivationPage.tsx",
    "apps/desktop-app/src/renderer/pages/LoginPage.tsx",
    "apps/desktop-app/src/renderer/pages/ModernChatPage.tsx",
    "apps/desktop-app/src/renderer/pages/MyConnectionsPage.tsx",
    "apps/desktop-app/src/renderer/pages/PricingPage.tsx",
    "apps/desktop-app/src/renderer/pages/ProfilePage.tsx",
    "apps/desktop-app/src/renderer/pages/QueriesPage.tsx",
    "apps/desktop-app/src/renderer/pages/SettingsPage.tsx",
    # Landing Site
    "apps/landing-site/src/app/auth/desktop-callback/page.tsx",
    "apps/landing-site/src/app/cookies/page.tsx",
    "apps/landing-site/src/app/error.tsx",
    "apps/landing-site/src/app/global-error.tsx",
    "apps/landing-site/src/app/login/page.tsx",
    "apps/landing-site/src/app/not-found.tsx",
    "apps/landing-site/src/app/privacy/page.tsx",
    "apps/landing-site/src/app/refund/page.tsx",
    "apps/landing-site/src/app/subscribe/checkout/page.tsx",
    "apps/landing-site/src/app/terms/page.tsx",
    "apps/landing-site/src/components/landing/CTASection.tsx",
    "apps/landing-site/src/components/landing/FAQSection.tsx",
    "apps/landing-site/src/components/landing/FeatureCard.tsx",
    "apps/landing-site/src/components/landing/FeaturesSection.tsx",
    "apps/landing-site/src/components/landing/Footer.tsx",
    "apps/landing-site/src/components/landing/HeroSection.tsx",
    "apps/landing-site/src/components/landing/HowItWorksSection.tsx",
    "apps/landing-site/src/components/landing/IntegrationsSection.tsx",
    "apps/landing-site/src/components/landing/LogosSection.tsx",
    "apps/landing-site/src/components/landing/Navbar.tsx",
    "apps/landing-site/src/components/landing/NewHeroSection.tsx",
    "apps/landing-site/src/components/landing/PricingSection.tsx",
    "apps/landing-site/src/components/landing/ROICalculator.tsx",
    "apps/landing-site/src/components/landing/SectionHeader.tsx",
    "apps/landing-site/src/components/landing/TrustSection.tsx",
    "apps/landing-site/src/components/ui/accordion.tsx",
    "apps/landing-site/src/components/ui/button.tsx",
    "apps/landing-site/src/components/ui/card.tsx",
]

def get_class_base(cls):
    """Extract the utility base from a tailwind class. e.g. 'bg' from 'bg-white', 'text' from 'text-gray-500'"""
    # Handle responsive/state prefixed classes  
    parts = cls.split(':')
    actual = parts[-1]  # last part is the actual utility
    
    # Common utility prefixes in tailwind
    # bg-X, text-X, border-X, ring-X, shadow-X, etc.
    # Also handle hover:, focus:, etc. variants
    match = re.match(r'^(-?)([\w]+(?:-[\w]+)?)', actual)
    if match:
        return match.group(0)
    return actual


def process_class_string(class_str):
    """Process a className string to resolve dark: classes."""
    classes = class_str.split()
    
    # Separate dark: and non-dark classes
    dark_classes = {}
    light_classes = []
    
    for cls in classes:
        if cls.startswith('dark:'):
            dark_val = cls[5:]  # Remove 'dark:' prefix
            # Get the utility type (e.g., 'bg', 'text', 'border')
            base = get_utility_type(dark_val)
            dark_classes[base] = dark_val
        else:
            light_classes.append(cls)
    
    # For each dark class, remove its light counterpart and add the dark value
    result = []
    for cls in light_classes:
        base = get_utility_type(cls)
        if base in dark_classes:
            # Skip this light class - dark version will replace it
            continue
        result.append(cls)
    
    # Add all dark values (without dark: prefix)
    for dark_val in dark_classes.values():
        result.append(dark_val)
    
    return ' '.join(result)


def get_utility_type(cls):
    """Get the utility type for conflict resolution.
    e.g., 'bg-white' → 'bg', 'text-gray-500' → 'text', 'border-gray-200' → 'border'
    Handles states like 'hover:bg-gray-100' → 'hover:bg'
    """
    # Remove any state prefix keeping track
    parts = cls.split(':')
    prefix = ':'.join(parts[:-1]) + ':' if len(parts) > 1 else ''
    actual = parts[-1]
    
    # Match utility type: everything before the last dash-separated value group
    # bg-white → bg, text-gray-500 → text, border-t-gray-200 → border-t
    # ring-2 → ring, shadow-md → shadow, rounded-lg → rounded
    
    # Special cases for compound utilities
    compound_prefixes = [
        'border-t', 'border-b', 'border-l', 'border-r',
        'border-x', 'border-y',
        'rounded-t', 'rounded-b', 'rounded-l', 'rounded-r',
        'rounded-tl', 'rounded-tr', 'rounded-bl', 'rounded-br',
        'p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-',
        'm-', 'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-',
    ]
    
    for cp in compound_prefixes:
        if actual.startswith(cp):
            return prefix + cp.rstrip('-')
    
    # General: take first segment
    m = re.match(r'^([\w]+)', actual)
    if m:
        return prefix + m.group(1)
    return prefix + actual


def transform_file(filepath):
    """Transform a single file to use dark theme."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Step 1: Process className strings with dark: classes
    # Match className="..." and className={`...`} patterns
    def replace_classname(match):
        full = match.group(0)
        class_str = match.group(1)
        
        if 'dark:' not in class_str:
            return full
        
        processed = process_class_string(class_str)
        return full.replace(class_str, processed)
    
    # Handle className="..." (simple strings)
    content = re.sub(
        r'className="([^"]*dark:[^"]*)"',
        replace_classname,
        content
    )
    
    # Handle className={`...${}...`} template literals with dark: 
    # This is trickier - handle className={`...dark:...`}
    content = re.sub(
        r"className=\{`([^`]*dark:[^`]*)`\}",
        replace_classname,
        content
    )
    
    # Handle className={cn("...dark:...")} and similar
    content = re.sub(
        r"""'([^']*dark:[^']*)'""",
        lambda m: "'" + process_class_string(m.group(1)) + "'",
        content
    )
    content = re.sub(
        r'"([^"]*dark:[^"]*)"',
        lambda m: '"' + process_class_string(m.group(1)) + '"',
        content
    )
    
    # Step 2: Replace remaining light-mode colors with dark equivalents
    # (for files that don't have dark: pairs)
    color_replacements = {
        # Backgrounds
        'bg-white': 'bg-background',
        'bg-gray-50': 'bg-secondary',
        'bg-gray-100': 'bg-secondary',
        'bg-gray-950': 'bg-background',
        # Text
        'text-black': 'text-foreground',
        'text-gray-900': 'text-foreground',
        'text-gray-800': 'text-foreground',
        'text-gray-700': 'text-muted-foreground',
        'text-gray-600': 'text-muted-foreground',
        'text-gray-500': 'text-muted-foreground',
        'text-gray-400': 'text-muted-foreground',
        # Borders
        'border-gray-200': 'border-border',
        'border-gray-300': 'border-border',
        'border-gray-100': 'border-border',
        # Dividers
        'divide-gray-200': 'divide-border',
        'divide-gray-100': 'divide-border',
    }
    
    for old, new in color_replacements.items():
        # Only replace when it's a standalone class (word boundary)
        content = re.sub(r'\b' + re.escape(old) + r'\b', new, content)
    
    # Step 3: Remove dark:prose-invert since we're always dark
    content = content.replace('dark:prose-invert', 'prose-invert')
    
    # Step 4: Remove any leftover dark: classes that weren't caught
    content = re.sub(r'\bdark:[\w\-\[\]/%.]+', '', content)
    
    # Step 5: Clean up double/triple spaces in class strings
    content = re.sub(r'  +', ' ', content)
    content = re.sub(r'" "', '""', content)  # empty classes
    content = re.sub(r'className=" "', 'className=""', content)
    
    # Step 6: Fix specific patterns
    # color-scheme: light → dark
    content = content.replace("color-scheme: light", "color-scheme: dark")
    content = content.replace("background-color: #ffffff", "background-color: #0a0a0a")
    content = content.replace("color: #000000", "color: #fafafa")
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False


def main():
    changed = 0
    errors = []
    
    for relpath in FILES:
        filepath = os.path.join(BASE, relpath)
        if not os.path.exists(filepath):
            errors.append(f"NOT FOUND: {relpath}")
            continue
        try:
            if transform_file(filepath):
                changed += 1
                print(f"  UPDATED: {relpath}")
            else:
                print(f"  NO CHANGE: {relpath}")
        except Exception as e:
            errors.append(f"ERROR {relpath}: {e}")
    
    print(f"\n--- Summary ---")
    print(f"Files updated: {changed}/{len(FILES)}")
    if errors:
        print(f"Errors:")
        for e in errors:
            print(f"  {e}")


if __name__ == "__main__":
    main()
