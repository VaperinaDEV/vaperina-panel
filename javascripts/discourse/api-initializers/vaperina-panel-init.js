import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { getURLWithCDN } from "discourse-common/lib/get-url";
import { action } from "@ember/object";
import { getOwner } from "discourse-common/lib/get-owner";
import Composer from "discourse/models/composer";
import DropdownSelectBoxComponent from "select-kit/components/dropdown-select-box";
import { computed } from "@ember/object";

export default {
  name: "vaperina-panel",
  initialize() {
    withPluginApi("0.8.7", (api) => {
      if (api.getCurrentUser() === null) return false;
      function getVaperinaPanel() {
        let pref = localStorage.getItem("vaperinaPanel");
        let result = settings.default_enabled;
        if (pref !== null) {
          result = pref === "true";
        }
        return result;
      }

      // technically we only want to amend current user here
      api.modifyClass("model:user", {
        vaperinaPanel: function() {
          return getVaperinaPanel();
        }.property()
      });
      
      api.modifyClass("controller:preferences/interface", {
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

      if (!getVaperinaPanel()) {
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

export DropdownSelectBoxComponent.extend({
  name: "vaperina-new-topic-drop",
  initialize() {
    withPluginApi("0.8.7", (api) => {
      api.registerConnectorClass("discovery-list-container-top", "vaperina-panel", {
        classNames: ["new-topic-dropdown-panel"],

        selectKitOptions: {
          icons: ["bolt"],
          showFullTitle: false,
          autoFilterable: false,
          filterable: false,
          showCaret: true,
          none: "topic.create",
        },

        content: computed(function () {

          const hideForNewUser = this.currentUser && this.currentUser.trust_level > 0;

          const items = [
            {
              id: "new_question",
              name: "Kérdésed van?",
              description: "Ne habozz, itt mindenki szívesen segít...",
              icon: "question-circle",
            },
          ];
          items.push({
            id: "new_comment",
            name: "Társalgó",
            description: "Dobj fel egy érdekes témát...",
            icon: "comment",
          });
          items.push({
            id: "new_handcheck",
            name: "Handcheck",
            description: "Vapemail? Na, hadd lássuk...",
            icon: "camera",
          });
          if (hideForNewUser) {
            items.push({
              id: "new_ad",
              name: "Hirdetésfeladás",
              description: "Hirdess gyorsan, egyszerűen...",
              icon: "tags",
            });
          }
          return items;
        }),

        @action
        onChange(selectedAction) {

          if (selectedAction === "new_question") {
            const composerController = getOwner(this).lookup("controller:composer");
            let categoryId = 49;

            composerController.open({
              action: Composer.CREATE_TOPIC,
              draftKey: Composer.NEW_TOPIC_KEY,
              categoryId: categoryId,
            });
          }

          if (selectedAction === "new_comment") {
            const composerController = getOwner(this).lookup("controller:composer");
            let categoryId = 7;

            composerController.open({
              action: Composer.CREATE_TOPIC,
              draftKey: Composer.NEW_TOPIC_KEY,
              categoryId: categoryId,
            });
          }

          if (selectedAction === "new_handcheck") {
            const composerController = getOwner(this).lookup("controller:composer");
            let categoryId = 5;

            composerController.open({
              action: Composer.CREATE_TOPIC,
              draftKey: Composer.NEW_TOPIC_KEY,
              categoryId: categoryId,
            });
          }

          if (selectedAction === "new_ad") {
            const composerController = getOwner(this).lookup("controller:composer");
            let categoryId = 31;

            composerController.open({
              action: Composer.CREATE_TOPIC,
              draftKey: Composer.NEW_TOPIC_KEY,
              categoryId: categoryId,
            });
          }
        },
      });
    });
  },
});
