import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

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
      }
    });
  },
};
