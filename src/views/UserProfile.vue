<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ChevronLeft, User, Phone, Calendar, Home, Crown, Shield, Heart, MessageSquare } from "lucide-vue-next";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default {
  name: "ProfileScreen",
  components: { 
    ChevronLeft, 
    User, 
    Phone, 
    Calendar, 
    Home, 
    Crown, 
    Shield, 
    Heart, 
    MessageSquare 
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const isLoggedIn = ref(false);
    const isLoading = ref(true);
    
    const userData = ref({
      name: "",
      dateOfBirth: "",
      phone: "(316) 555-0116",
      address: "3891 Ranchview Dr. Richardson, California 62639"
    });
    
    const goBack = () => {
      router.go(-1);
    };
    
    const editProfile = () => {
      router.push({ name: 'Setup1' });
    };
    
    const navigateTo = (route) => {
      router.push(route);
    };

    const fetchUserData = async (user) => {
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.profile?.basic) {
            userData.value = {
              ...userData.value,
              name: data.profile.basic.name,
              dateOfBirth: data.profile.basic.dateOfBirth
            };
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        isLoading.value = false;
      }
    };

    let auth;
    onMounted(() => {
      auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          isLoggedIn.value = true;
          fetchUserData(user);
        } else {
          isLoggedIn.value = false;
          isLoading.value = false;
        }
      });
    });

    const handleSignOut = () => {
      signOut(auth).then(() => {
        router.push('/auth/welcome');
      });
    }
    
    return {
      userData,
      goBack,
      editProfile,
      navigateTo,
      isLoggedIn,
      isLoading,
      handleSignOut
    };
  },
};
</script>
<template>
  <div class="page-container">
    <div class="header">
      <h1 class="title">Profile</h1>
      <div class="avatar">
        <img src="../assets/ProfileGirl.png" alt="Profile avatar" />
      </div>
    </div>
    <div class="content">
      <div class="profile-section">
        <div class="profile-item">
          <div class="icon"><User size="20" /></div>
          <div class="profile-text">{{ isLoading ? 'Loading...' : userData.name }}</div>
        </div>
        <div class="divider"></div>
        
        <div class="profile-item">
          <div class="icon"><Calendar size="20" /></div>
          <div class="profile-text">{{ isLoading ? 'Loading...' : userData.dateOfBirth }}</div>
        </div>
      </div>

      <button class="settings-button edit-profile-button" @click="editProfile">
        <div class="settings-button-content">
          <User size="20" />
          <span>Edit Your Profile</span>
        </div>
        <span class="arrow">→</span>
      </button>

      <h2 class="settings-header">Settings</h2>
      
      <div class="settings-section">
        <button class="settings-button sign-out-button" @click="handleSignOut" v-if="isLoggedIn">
          <span>Sign out</span>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #8a4d1e 0%, #1A1A1A 50%, #000000 100%);
  color: white;
  padding: 20px;
  padding-top: calc(50px + env(safe-area-inset-top, 0px));
  padding-left: calc(20px + env(safe-area-inset-left, 0px));
  padding-right: calc(20px + env(safe-area-inset-right, 0px));
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  padding: 20px 20px;
  margin: -5px -5px -5px -5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: calc(30px + env(safe-area-inset-top, 0px));
  padding-left: calc(20px + env(safe-area-inset-left, 0px));
  padding-right: calc(20px + env(safe-area-inset-right, 0px));
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: white;
  padding: 1rem;
}

.content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  margin-top: 70px;
}

.profile-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
}

.icon {
  margin-right: 16px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: white;
}

.profile-text {
  flex-grow: 1;
  font-size: 16px;
  color: white;
}

.settings-header {
  font-size: 22px;
  font-weight: 600;
  margin: 16px 0;
  color: white;
}

.settings-section {
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.button-spacer {
  height: 12px;
}

.settings-button {
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
}

.settings-button-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-profile-button {
  background: #1a73e8;
  color: #fff;
  justify-items: center;
}

.edit-profile-button:hover {
  background: #1557b0;
}

.edit-profile-button .arrow {
  color: rgba(255, 255, 255, 0.8);
  transition: transform 0.2s ease;
}

.edit-profile-button:hover .arrow {
  transform: translateX(4px);
}

.sign-out-button {
  background: rgba(255, 59, 48, 0.6);
  color: #fff;
  justify-content: center;
}

.sign-out-button:hover {
  background: rgba(255, 59, 48, 0.4);
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0;
}


</style>