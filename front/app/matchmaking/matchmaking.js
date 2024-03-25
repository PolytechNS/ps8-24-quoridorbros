async function enterMatchMaking() {

    const requestURL = `/api/matchmaking?userName=${encodeURIComponent(cookie.user)}`;

    const response = await fetch(requestURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const responseData = await response.text();

    if (response.status === 200) {
        alert("Matchmaking request sent successfully!");
    } else if (response.status === 400) {
        const errorResponse = JSON.parse(responseData);
        alert(`Bad request: ${errorResponse.error}`);
    } else if (response.status === 500) {
        alert("Internal Server Error. Please try again later.");
    } else {
        alert("Unexpected error. Please try again later.");
    }

}