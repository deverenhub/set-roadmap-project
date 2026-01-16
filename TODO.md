# SET Roadmap Platform - To Do List

## Pending Features

### High Priority
- [ ] **Email Notifications** - Send email alerts for @mentions and blocked milestones
- [ ] **Activity/Audit Log** - Track all changes to capabilities, milestones, and quick wins

### Medium Priority
- [ ] **File Attachments** - Attach files to capabilities and milestones
- [ ] **User Invitation System** - Invite new users via email

### Future Enhancements
- [ ] **Slack/Teams Integration** - Push notifications to collaboration tools
- [ ] **Dashboard Customization** - Allow users to customize dashboard widgets

## Completed

- [x] **Global Search** - Search across capabilities, milestones, and quick wins with Cmd+K keyboard shortcut
- [x] **PDF Export for Executive Reports** - Custom branded PDF with SET logo, application colors, and comprehensive executive summary
- [x] **Comments System** - Threaded comments on capabilities, milestones, and quick wins
- [x] **Notifications System** - Real-time in-app notifications with bell icon
- [x] **Milestone Detail Modal** - Full milestone view with status change buttons
- [x] **Quick Win Detail Modal** - Full quick win view with comments
- [x] **Blocked Milestone Alerts** - Automatic notifications when milestones are blocked
- [x] **Permission-based UI** - Status buttons only visible to admins/editors

---

## Notes

### Application Branding
- Primary Color: SET Teal (#0d9488)
- Logo: SET/JM Family brand
- Theme: Professional with Toyota association

### Database Tables
- `capabilities` - Operational capabilities with maturity levels
- `milestones` - Project milestones with path estimates
- `quick_wins` - Quick win initiatives
- `dependencies` - Capability relationships
- `comments` - Threaded comments
- `notifications` - In-app notifications
