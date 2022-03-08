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
        
        const body = document.querySelector('body');
        body.classList.add('vp');

        api.onAppEvent("composer:closed", () => {
          const body = document.querySelector('body');
          const homePage = document.querySelector('.navigation-topics');
          const categoryPage = document.querySelector('body[class*="category-"]:not(.archetype-regular):not(.archetype-banner)');
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

        api.onPageChange(() => {
          const homePage = document.querySelector('.navigation-topics');
          const categoryPage = document.querySelector('body[class*="category-"]:not(.archetype-regular):not(.archetype-banner)');
          const tagPage = document.querySelector('.tags-page');
          const ogCreateHasDraft = document.querySelector('#create-topic.open-draft');
          
          if (homePage && ogCreateHasDraft || categoryPage && ogCreateHasDraft || tagPage && ogCreateHasDraft) {
            const newCreateButton = document.querySelector('#new-create-topic');
            const vpNewTopic = document.querySelector('.vp-new-topic');
            const newCreateButtonLabel = document.querySelector('.new-create-topic .d-button-label');
            newCreateButton.classList.add('open-draft');
            vpNewTopic.classList.add('open-draft');
            newCreateButtonLabel.innerHTML = "Vázlat folytatása...";
          }
          
          const createTopicDisabled = document.querySelector('#create-topic[disabled]');
          const createTopicEnabled = document.querySelector('#create-topic');
          const newCreateButton = document.querySelector('#new-create-topic');
          
          if (categoryPage && createTopicDisabled || tagPage && createTopicDisabled) {
            newCreateButton.disabled = true;
          } else {
            if (categoryPage && createTopicEnabled || tagPage && createTopicEnabled) {
              newCreateButton.disabled = false;
            }
          }
        });

        api.registerConnectorClass("discovery-list-container-top", "vaperina-panel", {
          setupComponent(args, component) {
            let username = component.get("currentUser.username");

            fetch("/u/" + username + "/summary.json")
            .then(response => response.json())
            .then (result => {
              const userLikesReceived = result.user_summary.likes_received;
              const userLikesGiven = result.user_summary.likes_given;        
              const userDayVisited = result.user_summary.days_visited;
              const userTopicCount = result.user_summary.topic_count;
              const userPostCount = result.user_summary.post_count;
              const userTimeRead = result.user_summary.time_read;
              const userBookmarkCount = result.user_summary.bookmark_count;
              const userSolvedCount = result.user_summary.solved_count;

              component.set("userLikesReceived", userLikesReceived);
              component.set("userLikesGiven", userLikesGiven);
              component.set("userDayVisited", userDayVisited);
              component.set("userTopicCount", userTopicCount);
              component.set("userPostCount", userPostCount);
              component.set("userTimeRead", userTimeRead);
              component.set("userBookmarkCount", userBookmarkCount);
              component.set("userSolvedCount", userSolvedCount);
              
              component.set("userName", api.getCurrentUser().name);
              component.set("user", api.getCurrentUser().username);         
            });

            fetch("/u/" + username + "/card.json")
            .then(response => response.json())
            .then (result => {
              const userCardBg = result.card_background_upload_url;
              const stinkinBadges = [];
              const allBadges = result.badge_count;
              const followersCount = result.total_followers;
              const followingCount = result.total_following;

              if (result.badges) {
                result.badges.forEach(function(badges){
                  stinkinBadges.push(badges);
                });
              }
              component.set("userCardBg", `${getURLWithCDN(userCardBg)}`);
              component.set("stinkinBadges", stinkinBadges);
              component.set("allBadges", allBadges);
              component.set("followersCount", followersCount);
              component.set("followingCount", followingCount);
            });
          }
        });
      }
    });
  },
};
