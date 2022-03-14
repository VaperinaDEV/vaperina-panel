import Controller, { inject as controller } from "@ember/controller";
import I18n from "I18n";
import { alias } from "@ember/object/computed";
import bootbox from "bootbox";
import { exportUserArchive } from "discourse/lib/export-csv";
import discourseComputed, { observes } from "discourse-common/utils/decorators";

export default Controller.extend({
  @discourseComputed("currentUser.draft_count")
  draftLabel(count) {
    return count > 0
      ? I18n.t("drafts.label_with_count", { count })
      : I18n.t("drafts.label");
  },
});
