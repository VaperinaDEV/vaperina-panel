import Component from "@ember/component";
import FilterModeMixin from "discourse/mixins/filter-mode";
import NavItem from "discourse/models/nav-item";
import bootbox from "bootbox";
import discourseComputed from "discourse-common/utils/decorators";
import { NotificationLevels } from "discourse/lib/notification-levels";
import { inject as service } from "@ember/service";

export default Component.extend(FilterModeMixin, {
  router: service(),

  tagName: "",
  
  @discourseComputed("category", "createTopicDisabled")
  categoryReadOnlyBanner(category, createTopicDisabled) {
    if (category && this.currentUser && createTopicDisabled) {
      return category.read_only_banner;
    }
  },
  
  @discourseComputed(
    "createTopicDisabled",
    "hasDraft",
    "categoryReadOnlyBanner",
    "canCreateTopicOnTag",
    "tag.id"
  )
  createTopicButtonDisabled(
    createTopicDisabled,
    hasDraft,
    categoryReadOnlyBanner,
    canCreateTopicOnTag,
    tagId
  ) {
    if (tagId && !canCreateTopicOnTag) {
      return true;
    } else if (categoryReadOnlyBanner && !hasDraft) {
      return false;
    }
    return createTopicDisabled;
  },

  @discourseComputed("categoryReadOnlyBanner", "hasDraft")
  createTopicClass(categoryReadOnlyBanner, hasDraft) {
    let classNames = ["btn-default"];
    if (hasDraft) {
      classNames.push("open-draft");
    } else if (categoryReadOnlyBanner) {
      classNames.push("disabled");
    }
    return classNames.join(" ");
  },

  @discourseComputed("hasDraft")
  createTopicLabel(hasDraft) {
    return hasDraft ? "topic.open_draft" : "topic.create";
  },
  
  actions: {

    clickCreateTopicButton() {
      if (this.categoryReadOnlyBanner && !this.hasDraft) {
        bootbox.alert(this.categoryReadOnlyBanner);
      } else {
        this.createTopic();
      }
    },
  },
});
