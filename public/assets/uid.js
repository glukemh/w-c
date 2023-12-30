let uid = sessionStorage.getItem("uid") || "";
if (!uid) {
	uid = Math.random().toString(36).slice(2);
	sessionStorage.setItem("uid", uid);
}

export default uid;
