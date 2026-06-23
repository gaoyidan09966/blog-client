import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("client_user", () => {
  const token = ref(localStorage.getItem("client_token") || "");
  const userInfo = ref(
    JSON.parse(localStorage.getItem("client_user") || "null"),
  );

  const isLoggedIn = ref(!!token.value);

  const setLoginData = (tokenStr, user) => {
    token.value = tokenStr;
    userInfo.value = user;
    isLoggedIn.value = true;
    localStorage.setItem("client_token", tokenStr);
    localStorage.setItem("client_user", JSON.stringify(user));
  };

  const logout = () => {
    token.value = "";
    userInfo.value = null;
    isLoggedIn.value = false;
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
  };

  return { token, userInfo, isLoggedIn, setLoginData, logout };
});
