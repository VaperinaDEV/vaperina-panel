import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import Site from "discourse/models/site";

export default {
  name: "vaperina-panel",
  initialize() {
    if (Site.currentProp("!mobileView")) {
      return;
    }
    withPluginApi("0.8.7", (api) => {

      function getVaperinaPanel1() {
        let pref = localStorage.getItem("vaperinaPanel1");
        let result = settings.vaperina_panel;
        if (pref !== null || pref === null) {
          result = pref === "true";
        }
        return result;
      }

      if (!getVaperinaPanel1()) {
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
          return getVaperinaPanel1();
        }.property()
      });

      api.modifyClass("controller:preferences/interface", {
        pluginId: "button-add",
        actions: {
          save() {
            this._super();
            if (getVaperinaPanel1() != this.get("model.vaperinaPanel1")) {
              Discourse.set("assetVersion", "forceRefresh");
            }
            localStorage.setItem(
              "vaperinaPanel1",
              this.get("model.vaperinaPanel1").toString()
            );
          }
        }
      });

      if (getVaperinaPanel1()) {

        if (api.getCurrentUser() === null) return false;
        const body = document.querySelector('body');
        body.classList.add('vp');

        api.onAppEvent("composer:closed", () => {
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
            newCreateButtonLabel.innerHTML = "V??zlat folytat??sa...";
          }
        });
          
        api.onAppEvent("draft:destroyed", () => {
          const homePage = document.querySelector('.navigation-topics');
          const categoryPage = document.querySelector('body[class*="category-"]:not(.archetype-regular):not(.archetype-banner)');
          const tagPage = document.querySelector('.tags-page');
          const ogCreateHasDraft = document.querySelector('#create-topic.open-draft');
          const ogCreateNoDraft = document.querySelector('#create-topic');

          if (homePage && ogCreateNoDraft || categoryPage && ogCreateNoDraft || tagPage && ogCreateNoDraft) {
            const newCreateButton = document.querySelector('#new-create-topic');
            const vpNewTopic = document.querySelector('.vp-new-topic');
            const newCreateButtonLabel = document.querySelector('.new-create-topic .d-button-label');
            newCreateButton.classList.remove('open-draft');
            vpNewTopic.classList.remove('open-draft');
            newCreateButtonLabel.innerHTML = "??rj egy ??j t??m??t...";
          }
        });
        
        api.onPageChange(() => {
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
            newCreateButtonLabel.innerHTML = "V??zlat folytat??sa...";
          }
          
          const createTopicButtonDisabled = document.querySelector('#create-topic[disabled]');
          const createTopicButton = document.querySelector('#create-topic');

          if (categoryPage && createTopicButtonDisabled || tagPage && createTopicButtonDisabled) {
            const newCreateButton = document.querySelector('#new-create-topic');
            newCreateButton.disabled = true;
          } else {
            if (categoryPage && createTopicButton || tagPage && createTopicButton) {
              const newCreateButton = document.querySelector('#new-create-topic');
              newCreateButton.disabled = false;
            }
          }
        });
      }
    });
  },
};
