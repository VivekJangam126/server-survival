/**
 * UI Components Index
 * Exports all reusable UI components for Learn Mode and Mapping Hub
 */

// Import all components
import { SectionHeader } from './SectionHeader.js';
import { ExpandableCard } from './ExpandableCard.js';
import { InfoPanel } from './InfoPanel.js';
import { TagBadge, createBadgeGroup, VARIANT_CLASSES } from './TagBadge.js';
import { LearnLink, createLearnLinkGroup } from './LearnLink.js';
import { EmptyState } from './EmptyState.js';

// Named exports
export {
    SectionHeader,
    ExpandableCard,
    InfoPanel,
    TagBadge,
    createBadgeGroup,
    VARIANT_CLASSES,
    LearnLink,
    createLearnLinkGroup,
    EmptyState
};

// Default export with all components
const UIComponents = {
    SectionHeader,
    ExpandableCard,
    InfoPanel,
    TagBadge,
    LearnLink,
    EmptyState
};

export default UIComponents;
