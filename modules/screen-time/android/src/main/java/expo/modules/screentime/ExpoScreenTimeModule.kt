package expo.modules.screentime

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Misst die Bildschirmzeit über Androids UsageStatsManager.
 * Voraussetzung: Der Nutzer erlaubt „Nutzungsdatenzugriff“ in den Systemeinstellungen.
 */
class ExpoScreenTimeModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("Kein Android-Kontext verfügbar")

  override fun definition() = ModuleDefinition {
    Name("ExpoScreenTime")

    // Prüft, ob die App Nutzungsdaten lesen darf
    Function("hasPermission") {
      hasUsagePermission()
    }

    // Öffnet die Systemseite, auf der Nutzer:innen den Zugriff erlauben
    Function("openPermissionSettings") {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
    }

    // Liefert die Vordergrundzeit pro App im Zeitraum [startMs, endMs]
    AsyncFunction("getUsage") { startMs: Double, endMs: Double ->
      if (!hasUsagePermission()) {
        return@AsyncFunction emptyList<Map<String, Any>>()
      }
      computeUsage(startMs.toLong(), endMs.toLong())
    }
  }

  private fun hasUsagePermission(): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  // Berechnet die Nutzungsdauer aus Vordergrund-/Hintergrund-Ereignissen (genauer als die Tagesstatistik)
  private fun computeUsage(start: Long, end: Long): List<Map<String, Any>> {
    val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val events = usm.queryEvents(start, end)
    val openSince = HashMap<String, Long>()
    val totals = HashMap<String, Long>()
    val event = UsageEvents.Event()

    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      val pkg = event.packageName ?: continue
      when (event.eventType) {
        UsageEvents.Event.ACTIVITY_RESUMED -> openSince[pkg] = event.timeStamp
        UsageEvents.Event.ACTIVITY_PAUSED, UsageEvents.Event.ACTIVITY_STOPPED -> {
          val since = openSince.remove(pkg)
          if (since != null) totals[pkg] = (totals[pkg] ?: 0L) + (event.timeStamp - since)
        }
      }
    }
    // Apps, die noch im Vordergrund sind, bis zum Ende des Zeitraums zählen
    val now = minOf(end, System.currentTimeMillis())
    for ((pkg, since) in openSince) {
      totals[pkg] = (totals[pkg] ?: 0L) + (now - since)
    }

    val pm = context.packageManager
    return totals
      .filter { it.value > 30_000 && it.key != context.packageName && !isLauncher(pm, it.key) }
      .map { (pkg, ms) ->
        mapOf("packageName" to pkg, "appName" to appLabel(pm, pkg), "totalMs" to ms.toDouble())
      }
      .sortedByDescending { it["totalMs"] as Double }
  }

  private fun appLabel(pm: PackageManager, pkg: String): String = try {
    pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
  } catch (e: Exception) {
    pkg
  }

  // Der Startbildschirm (Launcher) soll nicht als App-Nutzung zählen
  private fun isLauncher(pm: PackageManager, pkg: String): Boolean {
    val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
    val home = pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
    return home?.activityInfo?.packageName == pkg
  }
}
