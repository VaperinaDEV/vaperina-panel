import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { getURLWithCDN } from "discourse-common/lib/get-url";

export default {
  name: "vaperina-panel",
  initialize() {
    withPluginApi("0.8.7", (api) => {
      
      function getVaperinaPanel() {
        let pref = localStorage.getItem("vaperinaPanel");
        let result = settings.vaperina_panel;
        if (pref !== null || pref === null) {
          result = pref === "true";
        }
        return result;
      }
      
      if (!getVaperinaPanel()) {
        api.registerConnectorClass("discovery-list-container-top", "vaperina-panel", {
          shouldRender() {
            return false;
          }
        });
        api.registerConnectorClass("discovery-list-container-top", "search-banner", {
          shouldRender() {
            return false;
          }
        });
      }
      // technically we only want to amend current user here
      api.modifyClass("model:user", {
        pluginId: "user-setting",
        vaperinaPanel: function() {
          return getVaperinaPanel();
        }.property()
      });
      
      api.modifyClass("controller:preferences/interface", {
        pluginId: "button-add",
        actions: {
          save() {
            this._super();
            if (getVaperinaPanel() != this.get("model.vaperinaPanel")) {
              Discourse.set("assetVersion", "forceRefresh");
            }
            localStorage.setItem(
              "vaperinaPanel",
              this.get("model.vaperinaPanel").toString()
            );
          }
        }
      });
  
      if (getVaperinaPanel()) {
        
        if (api.getCurrentUser() === null) return false;

        api.onAppEvent("composer:closed", () => {
          const homePage = document.querySelector('.navigation-topics');
          const categoryPage = document.querySelector('.category-header');
          const tagPage = document.querySelector('.tags-page');
          const ogCreateHasDraft = document.querySelector('#create-topic.open-draft');
          const ogCreateNoDraft = document.querySelector('#create-topic');

          if (homePage && ogCreateHasDraft || categoryPage && ogCreateHasDraft || tagPage && ogCreateHasDraft) {
            const newCreateButton = document.querySelector('#new-create-topic');
            const vpNewTopic = document.querySelector('.vp-new-topic');
            const newCreateButtonLabel = document.querySelector('.new-create-topic .d-button-label');
            newCreateButton.classList.add('open-draft');
            vpNewTopic.classList.add('open-draft');
            newCreateButtonLabel.innerHTML = "Vázlat folytatása...";
          } else {
            if (homePage && ogCreateNoDraft || categoryPage && ogCreateNoDraft || tagPage && ogCreateNoDraft) {
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
          const body = document.querySelector('body');
          const homePage = document.querySelector('.navigation-topics');
          const categoryPage = document.querySelector('.category-header');
          const tagPage = document.querySelector('.tags-page');
          const ogCreateHasDraft = document.querySelector('#create-topic.open-draft');
          
          if (homePage || categoryPage) {
            body.classList.add('vp');
          }

          if (homePage && ogCreateHasDraft || categoryPage && ogCreateHasDraft || tagPage && ogCreateHasDraft) {
            const newCreateButton = document.querySelector('#new-create-topic');
            const vpNewTopic = document.querySelector('.vp-new-topic');
            const newCreateButtonLabel = document.querySelector('.new-create-topic .d-button-label');
            newCreateButton.classList.add('open-draft');
            vpNewTopic.classList.add('open-draft');
            newCreateButtonLabel.innerHTML = "Vázlat folytatása...";
          }

          const ogCreateDisable = document.querySelector('#create-topic');

          if (homePage && ogCreateDisable.hasAttribute("disabled") || categoryPage && ogCreateDisable.hasAttribute("disabled") || tagPage && ogCreateDisable.hasAttribute("disabled")) {
            const newCreateButton = document.querySelector('#new-create-topic');
            newCreateButton.disabled = true;
          } else {
            if (homePage && ogCreateDisable || categoryPage && ogCreateDisable || tagPage && ogCreateDisable) {
              const newCreateButton = document.querySelector('#new-create-topic');
              newCreateButton.disabled = false;
            }
          }
        });

        api.registerConnectorClass("discovery-list-container-top", "vaperina-panel", {
          setupComponent(args, component) {
            let username = component.get("currentUser.username");

            ajax("/u/" + username + "/summary.json").then (function(result) {

              const userLikesReceived = result.user_summary.likes_received;
              const userLikesGiven = result.user_summary.likes_given;

              component.set("userLikesReceived", userLikesReceived);
              component.set("userLikesGiven", userLikesGiven);
              component.set("userName", api.getCurrentUser().name);
              component.set("user", api.getCurrentUser().username);         
            });

            ajax("/u/" + username + "/card.json").then (function(result) {
              const userCardBg = result.user.card_background_upload_url;
              const stinkinBadges = [];

              if (result.badges) {
                result.badges.forEach(function(badges){
                  stinkinBadges.push(badges);
                });
              }
              component.set("userCardBg", `${getURLWithCDN(userCardBg)}`);
              component.set("stinkinBadges", stinkinBadges);
            });
          }
        });
      }
    });
  },
};
