const FriendsService = {
  async getFriends(username) {
    const response = await fetch(endpoint+`/api/friends?of=${username}`);
    if (response.status !== 200) {
      throw new Error("Failed to fetch friends");
    }
    return response.json();
  },
  async getFriendRequests(username) {
    const response = await fetch(endpoint+`/api/friendRequests?userId=${username}`);
    if (response.status !== 200) {
      throw new Error("Failed to friend requests");
    }
    return response.json();
  },
  async sendFriendRequest(sender, receiver) {
    const requestURL = endpoint+`/api/friend?sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}`;

    const response = await fetch(requestURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseData = await response.text();
    if (response.status === 200) {
      alert("Friend request sent successfully!");
    } else if (response.status === 400) {
      const errorResponse = JSON.parse(responseData);
      alert(`Bad request: ${errorResponse.error}`);
    } else if (response.status === 500) {
      alert("Internal Server Error. Please try again later.");
    } else {
      alert("Unexpected error. Please try again later.");
    }
  },
  async acceptFriendRequest(sender, receiver) {
    const requestURL = endpoint+`/api/friend/accept?from=${encodeURIComponent(sender)}&to=${encodeURIComponent(receiver)}`;
    const response = await fetch(requestURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      alert(`Accepted friend request from ${sender}`);
    } else {
      throw new Error("Failed to accept friend request");
    }
  },
  async declineFriendRequest(sender, receiver) {
    const requestURL = endpoint+`/api/friend/decline?from=${encodeURIComponent(sender)}&to=${encodeURIComponent(receiver)}`;
    const response = await fetch(requestURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      alert(`Declined friend request from ${sender}`);
    } else {
      throw new Error("Failed to decline friend request");
    }
  },
};
