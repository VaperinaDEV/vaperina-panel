import { action } from "@ember/object";
import { getOwner } from "discourse-common/lib/get-owner";
import Composer from "discourse/models/composer";
import DropdownSelectBoxComponent from "select-kit/components/dropdown-select-box";
import { computed } from "@ember/object";

function getVaperinaPanel() {
  let pref = localStorage.getItem("vaperinaPanel");
  let result = settings.default_enabled;
  if (pref !== null) {
    result = pref === "true";
  }
  return result;
}

export default DropdownSelectBoxComponent.extend({
  classNames: ["new-topic-dropdown-panel"],

  selectKitOptions: {
    icons: ["bolt"],
    showFullTitle: false,
    autoFilterable: false,
    filterable: false,
    showCaret: true,
    none: "topic.create",
  },
  function getVaperinaPanel() {
    let pref = localStorage.getItem("vaperinaPanel");
    let result = settings.default_enabled;
    if (pref !== null) {
      result = pref === "true";
    }
    return result;
  }
  if (!getVaperinaPanel()) {
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
  }

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
