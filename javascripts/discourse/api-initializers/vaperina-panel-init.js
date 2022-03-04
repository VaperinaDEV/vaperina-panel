import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "vaperina-panel",
  initialize() {
    withPluginApi("0.8.7", (api) => {
      api.onAppEvent("composer:closed", () => {
        const homePage = document.querySelector('.navigation-topics');
        const categoryPage = document.querySelector('.category .list-container');
        const ogCreateHasDraft = document.querySelector('#create-topic.open-draft');
        const ogCreateNoDraft = document.querySelector('#create-topic');
        
        if (homePage && ogCreateHasDraft || categoryPage && ogCreateHasDraft) {
          const newCreateButton = document.querySelector('#new-create-topic');
          const vpNewTopic = document.querySelector('.vp-new-topic');
          const newCreateButtonLabel = document.querySelector('.new-create-topic .d-button-label');
          newCreateButton.classList.add('open-draft');
          vpNewTopic.classList.add('open-draft');
          newCreateButtonLabel.innerHTML = "Vázlat folytatása...";
        } else {
          if (homePage && ogCreateNoDraft || categoryPage && ogCreateNoDraft) {
            const newCreateButton = document.querySelector('#new-create-topic');
            const vpNewTopic = document.querySelector('.vp-new-topic');
            const newCreateButtonLabel = document.querySelector('.new-create-topic .d-button-label');
            newCreateButton.classList.remove('open-draft');
            vpNewTopic.classList.remove('open-draft');
            newCreateButtonLabel.innerHTML = "Írj egy új témát...";
          }
        }
      });
      api.onPageChange((url, title) => {
        const homePage = document.querySelector('.navigation-topics');
        const categoryPage = document.querySelector('.category .list-container');
        const ogCreateHasDraft = document.querySelector('#create-topic.open-draft');
        
        if (homePage && ogCreateHasDraft || categoryPage && ogCreateHasDraft) {
          const newCreateButton = document.querySelector('#new-create-topic');
          const vpNewTopic = document.querySelector('.vp-new-topic');
          const newCreateButtonLabel = document.querySelector('.new-create-topic .d-button-label');
          newCreateButton.classList.add('open-draft');
          vpNewTopic.classList.add('open-draft');
          newCreateButtonLabel.innerHTML = "Vázlat folytatása...";
        }
        
        const ogCreateDisable = document.querySelector('#create-topic');
        
        if (homePage && ogCreateDisable.hasAttribute("disabled") || categoryPage && ogCreateDisable.hasAttribute("disabled")) {
          const newCreateButton = document.querySelector('#new-create-topic');
          newCreateButton.disabled = true;
        } else {
          if (homePage && ogCreateDisable || categoryPage && ogCreateDisable) {
            const newCreateButton = document.querySelector('#new-create-topic');
            newCreateButton.disabled = false;
          }
        }
      });
      api.registerConnectorClass("discovery-list-container-top", "vaperina-panel", {
        setupComponent(args, component) {
          let username = component.get("currentUser.username");

          fetch("https://raw.githubusercontent.com/VaperinaDEV/tudtad/main/index.json")
          .then(response => response.json())
          .then(quotes => {
            const rand = Math.floor(Math.random() * quotes.length);
            component.set('quote', quotes[rand]);
          });

          ajax("/u/" + username + "/summary.json").then (function(result) {

            const stinkinBadges = [];

            const userLikesReceived = result.user_summary.likes_received;
            const userLikesGiven = result.user_summary.likes_given;

            if (result.badges) {
              result.badges.forEach(function(badges){
                stinkinBadges.push(badges);
              });
            }

            component.set("userLikesReceived", userLikesReceived);
            component.set("userLikesGiven", userLikesGiven);
            component.set("stinkinBadges", stinkinBadges);
            component.set("userName", api.getCurrentUser().name);
            component.set("user", api.getCurrentUser().username);
            component.set("userCardBg", api.getCurrentUser().card_background_upload_url);            
          });
        }
      });
    });
  },
};
