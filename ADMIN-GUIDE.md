# Digital Art Auction Platform - Admin Guide

## Introduction

This guide is intended for administrators of the Digital Art Auction platform. It provides instructions on how to use the administrative features to manage auctions, adjust bidding parameters, and moderate the chat system.

## Admin Authentication

Admin access is restricted to wallet addresses that have been pre-configured in the system. The default admin wallet is `0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0`. You must connect with an admin wallet to access admin features.

## Bid Settings Management

### Accessing Bid Settings

1. Connect your admin wallet
2. Navigate to `/admin/bid-settings` in the browser
3. The Bid Settings Panel will be displayed

### Adjustable Parameters

1. **Minimum Bid Increment Percentage**
   - Default: 1% of current bid
   - Adjustable range: 1% to 10%
   - Use the slider to set the desired percentage

2. **Maximum Bid Increment**
   - Fixed at 10% of current bid
   - This parameter cannot be adjusted for fairness reasons

### How to Apply Changes

1. Adjust the minimum bid increment using the slider
2. Click "Save Settings" to apply the changes
3. Changes take effect immediately for all ongoing and future auctions

## Chat Moderation

### Moderator Actions

As an admin, you have special privileges in the chat system:

#### Deleting Messages
1. Hover over any message in the chat
2. Click the three-dot menu icon that appears
3. Select "Delete Message"
4. The message will be permanently removed for all users

#### Muting Users
1. Hover over any message from the user you want to mute
2. Click the three-dot menu icon
3. Select "Mute User"
4. Choose a duration (5 minutes, 30 minutes, 1 hour, or 24 hours)
5. The user will be unable to send messages for the selected duration

### Chat Export

As an admin, you can export the entire chat history:

1. Click the download icon in the top right of the chat window
2. A CSV file containing all chat messages will be downloaded
3. The export includes: timestamp, wallet address, display name, message content, and user level

## User Management

### Accessing User Management

1. Connect your admin wallet
2. Navigate to `/admin/users` in the browser
3. The User Management panel will be displayed

### Username Change Requests

Users can request to change how their username is displayed in the platform. As an admin, you need to review and approve these requests:

1. **Viewing Requests**
   - All pending username change requests appear in the User Management panel
   - Each request shows the user's wallet address, current display name, and when the request was made

2. **Approving Requests**
   - Review the request details
   - Click the green checkmark button to approve the request
   - The user will be able to use their new username immediately

3. **Rejecting Requests**
   - If a username change request is inappropriate, click the red X button to reject it
   - The user will continue to use their previous username

## Auction Management

### Creating New Auctions

1. Navigate to the Auction Management panel
2. Click "Create New Auction"
3. Fill in the required details:
   - Artwork selection
   - Starting price
   - Duration

### Managing Existing Auctions

For each auction, you can:
1. **Edit**: Modify auction details before it starts
2. **Start**: Activate a draft auction
3. **Pause/Resume**: Temporarily suspend or resume an active auction
4. **End**: Manually end an auction before its scheduled end time

## Best Practices

1. **Bid Settings**:
   - Avoid changing bid parameters frequently during an auction
   - Consider notifying users before making significant changes

2. **Chat Moderation**:
   - Use muting sparingly and for clear violations
   - Keep a record of moderation actions in case of disputes

3. **Auction Management**:
   - Schedule auctions with sufficient gaps between them
   - Monitor active auctions regularly for unusual bidding patterns

## Troubleshooting

1. **Bid Settings Not Updating**:
   - Ensure you're connected with an admin wallet
   - Refresh the page and try again
   - Check browser console for errors

2. **Chat Moderation Issues**:
   - Verify your admin status is properly recognized
   - Try reconnecting your wallet
   - Check if the socket server is running

3. **Export Failures**:
   - Ensure there are messages to export
   - Check if you have sufficient permissions on your device for downloads
   - Try using a different browser

For technical support, contact the development team at dev@digitalartauction.example.com
